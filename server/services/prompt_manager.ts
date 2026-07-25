import { systemRules, prompts } from "../prompts/templates";

export class PromptManager {
  getSystemPrompt(): string {
    return systemRules;
  }

  getPrompt(templateName: keyof typeof prompts, variables: Record<string, string>): string {
    let template = prompts[templateName];
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }

    // Replace variables e.g. {user_query}
    for (const [key, value] of Object.entries(variables)) {
      template = template.replace(new RegExp(`{${key}}`, "g"), value);
    }

    return template;
  }
}

export const promptManager = new PromptManager();
