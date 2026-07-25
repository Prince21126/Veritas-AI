import { IngestionPipeline } from "./ingestion";
import { globalStore, Source } from "../store";
import Parser from "rss-parser";
import * as cheerio from "cheerio";
import crypto from "crypto";

export class KnowledgeCollector {
  private intervalId: NodeJS.Timeout | null = null;
  private rssParser = new Parser();
  
  // Track seen URLs to avoid duplicate indexing
  private seenUrls: Set<string> = new Set();
  
  public status = "stopped";
  public lastRun: Date | null = null;
  public docsIndexedToday = 0;
  public errorsToday = 0;
  public intervalMs = 21600000;

  constructor(private ingestionPipeline: IngestionPipeline) {}

  start(intervalMs: number = 3600000) {
    this.intervalMs = intervalMs;
    console.log("[Collector] Starting automatic knowledge collection...");
    this.status = "running";
    this.intervalId = setInterval(() => this.collect(), intervalMs);
    // Initial run
    setTimeout(() => this.collect(), 5000); 
  }

  stop() {
    console.log("[Collector] Stopping automatic knowledge collection...");
    if (this.intervalId) clearInterval(this.intervalId);
    this.status = "stopped";
  }

  async fetchRss(source: Source): Promise<{ buffer: Buffer, mimeType: string, filename: string, title: string, link: string }[]> {
    const docs = [];
    try {
      const feed = await this.rssParser.parseURL(source.url);
      
      for (const item of feed.items || []) {
        if (!item.link || this.seenUrls.has(item.link)) continue;
        
        let contentToExtract = "";
        
        // Sometimes content is full HTML in content:encoded, sometimes just summary
        if (item["content:encoded"]) {
          const $ = cheerio.load(item["content:encoded"]);
          contentToExtract = $.text();
        } else if (item.content) {
          const $ = cheerio.load(item.content);
          contentToExtract = $.text();
        } else if (item.contentSnippet) {
          contentToExtract = item.contentSnippet;
        }

        if (!contentToExtract || contentToExtract.trim().length < 50) continue;
        
        // Add metadata to the text for better context
        const fullText = `Titre: ${item.title}\nSource: ${source.name}\nDate: ${item.pubDate}\nLien: ${item.link}\n\nContenu:\n${contentToExtract.trim()}`;
        
        docs.push({
          buffer: Buffer.from(fullText),
          mimeType: "text/plain",
          filename: `rss_${crypto.createHash('md5').update(item.link).digest('hex')}.txt`,
          title: item.title || "Sans titre",
          link: item.link
        });
        
        this.seenUrls.add(item.link);
      }
    } catch (err) {
      console.error(`[Collector] Error parsing RSS for ${source.name}:`, err);
      this.errorsToday++;
    }
    return docs;
  }

  async collect() {
    console.log("[Collector] Running scheduled collection cycle...");
    this.lastRun = new Date();
    
    // Reset counters if a new day
    const now = new Date();
    if (this.lastRun && this.lastRun.getDate() !== now.getDate()) {
      this.docsIndexedToday = 0;
      this.errorsToday = 0;
    }

    const activeSources = globalStore.sources.filter(s => s.status === 'active');
    
    for (const source of activeSources) {
      try {
        let docs = [];
        if (source.type === 'rss') {
          docs = await this.fetchRss(source);
        } else {
          // generic html scraper could be added here
          console.log(`[Collector] HTML scraping not fully implemented for ${source.url}, skipping...`);
        }
        
        for (const doc of docs) {
          console.log(`[Collector] Ingesting: ${doc.title}`);
          try {
            const res = await this.ingestionPipeline.ingestFile(doc.buffer, doc.mimeType, doc.filename);
            if (res) {
              this.docsIndexedToday++;
              // Update source stats
              globalStore.updateSource(source.id, { 
                documents_collected: (source.documents_collected || 0) + 1,
                last_sync: new Date().toISOString()
              });
              console.log(`[Collector] Successfully ingested ${doc.title} (${res.chunks_count} chunks)`);
            }
          } catch (err: any) {
            console.error(`[Collector] Error ingesting ${doc.title}:`, err);
            this.errorsToday++;
            // If quota error, stop the entire collection cycle
            if (err?.message?.includes("RESOURCE_EXHAUSTED") || err?.status === 429) {
              console.warn("[Collector] Quota exhausted, stopping collection cycle.");
              return; // Stop collection
            }
          }
        }
      } catch (err) {
        console.error(`[Collector] Error fetching from ${source.name}:`, err);
        this.errorsToday++;
      }
    }
    console.log("[Collector] Collection cycle complete.");
  }
}
