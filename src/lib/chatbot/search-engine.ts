/**
 * Chatbot Search Engine
 * 
 * Implements keyword matching and semantic similarity for finding relevant responses
 * from the knowledge base without using external AI APIs.
 */

import { knowledgeBase, KnowledgeItem, outOfScopeResponse } from './knowledge-base';

export interface SearchResult {
  item: KnowledgeItem;
  score: number;
}

export interface ChatbotResponse {
  answer: string;
  category: string;
  confidence: number;
  suggestions?: string[];
}

/**
 * Normalize text for comparison - lowercase, remove special chars, etc.
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculate keyword match score between query and knowledge item
 */
function calculateKeywordScore(query: string, item: KnowledgeItem): number {
  const normalizedQuery = normalizeText(query);
  const queryWords = normalizedQuery.split(' ').filter(w => w.length > 2);
  
  let score = 0;
  let matchedKeywords = 0;
  
  // Check against item keywords
  for (const keyword of item.keywords) {
    const normalizedKeyword = normalizeText(keyword);
    if (normalizedQuery.includes(normalizedKeyword)) {
      score += 2; // Direct keyword match
      matchedKeywords++;
    }
    
    // Check for partial word matches
    for (const queryWord of queryWords) {
      if (normalizedKeyword.includes(queryWord) || queryWord.includes(normalizedKeyword)) {
        score += 1; // Partial match
      }
    }
  }
  
  // Check against question text
  const normalizedQuestion = normalizeText(item.question);
  for (const queryWord of queryWords) {
    if (normalizedQuestion.includes(queryWord)) {
      score += 1.5;
    }
  }
  
  // Check against answer text (lower weight)
  const normalizedAnswer = normalizeText(item.answer);
  for (const queryWord of queryWords) {
    if (normalizedAnswer.includes(queryWord)) {
      score += 0.5;
    }
  }
  
  // Boost score based on priority
  score *= (1 + (item.priority / 20));
  
  // Bonus for multiple keyword matches
  if (matchedKeywords > 1) {
    score *= 1.2;
  }
  
  return score;
}

/**
 * Search knowledge base for relevant responses
 */
export function searchKnowledgeBase(query: string, threshold: number = 1.5): SearchResult[] {
  const results: SearchResult[] = [];
  
  for (const item of knowledgeBase) {
    const score = calculateKeywordScore(query, item);
    if (score >= threshold) {
      results.push({ item, score });
    }
  }
  
  // Sort by score descending
  results.sort((a, b) => b.score - a.score);
  
  return results;
}

/**
 * Get the best response for a query
 */
export function getBestResponse(query: string): ChatbotResponse {
  const results = searchKnowledgeBase(query, 1.0);
  
  if (results.length === 0) {
    // No relevant results found
    return {
      answer: outOfScopeResponse,
      category: 'general',
      confidence: 0,
      suggestions: getFallbackSuggestions()
    };
  }
  
  const bestResult = results[0];
  const confidence = Math.min(bestResult.score / 5, 1); // Normalize to 0-1
  
  // Get suggestions from other high-scoring results
  const suggestions = results
    .slice(1, 4)
    .filter(r => r.score >= 2)
    .map(r => r.item.question);
  
  return {
    answer: bestResult.item.answer,
    category: bestResult.item.category,
    confidence,
    suggestions: suggestions.length > 0 ? suggestions : undefined
  };
}

/**
 * Get fallback suggestions when no match is found
 */
function getFallbackSuggestions(): string[] {
  return [
    "What services do you offer?",
    "How do I book a tour?",
    "What destinations do you cover?",
    "How can I contact you?",
    "What is your mission?"
  ];
}

/**
 * Get quick action suggestions for common topics
 */
export function getQuickActions(): string[] {
  return [
    "What services do you offer?",
    "How do I book a tour?",
    "What destinations are available?",
    "How can I contact support?",
    "Do you offer custom itineraries?",
    "What are your business hours?"
  ];
}

/**
 * Check if a query is related to the organization
 */
export function isRelatedQuery(query: string): boolean {
  const results = searchKnowledgeBase(query, 0.5);
  return results.length > 0;
}

/**
 * Get welcome message
 */
export function getWelcomeMessage(): string {
  return "Welcome to OJO Tours! I'm here to help you with questions about our safaris, destinations, bookings, and services. How can I assist you today?";
}

/**
 * Get typing indicator text
 */
export function getTypingIndicator(): string {
  const messages = [
    "Searching our knowledge base...",
    "Finding the best answer...",
    "Looking up information...",
    "Checking our tours..."
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}
