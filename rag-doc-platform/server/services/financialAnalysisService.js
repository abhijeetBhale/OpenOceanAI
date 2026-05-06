const INVOICE_KEYWORDS = ['invoice', 'bill to', 'bill', 'due date', 'payment terms', 'vendor', 'line item', 'subtotal', 'total due', 'invoice number', 'invoice date'];

const FINANCIAL_KEYWORDS = ['revenue', 'profit', 'loss', 'income', 'expense', 'balance sheet', 'income statement', 'cash flow', 'asset', 'liability', 'equity', 'ebitda', 'gross profit', 'net income', 'operating expense'];

const CURRENCY_REGEX = /[$€£¥]?\s*[\d,]+\.?\d*/g;
const PERCENTAGE_REGEX = /[\d,]+\.?\d*%/g;
const DATE_REGEX = /\b(?:\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/g;

function extractCurrencyValues(text) {
  const matches = text.match(CURRENCY_REGEX);
  if (!matches) return [];
  
  const values = matches.map(m => {
    const num = parseFloat(m.replace(/[$€£¥,\s]/g, ''));
    return isNaN(num) ? null : num;
  }).filter(v => v !== null);
  
  return values.sort((a, b) => b - a);
}

function extractPercentages(text) {
  const matches = text.match(PERCENTAGE_REGEX);
  if (!matches) return [];
  
  return matches.map(m => parseFloat(m.replace('%', ''))).filter(p => !isNaN(p));
}

function detectDocumentType(text) {
  const lowerText = text.toLowerCase();
  
  const invoiceScore = INVOICE_KEYWORDS.reduce((sum, kw) => {
    return sum + (lowerText.includes(kw.toLowerCase()) ? 1 : 0);
  }, 0);
  
  const financialScore = FINANCIAL_KEYWORDS.reduce((sum, kw) => {
    return sum + (lowerText.includes(kw.toLowerCase()) ? 1 : 0);
  }, 0);
  
  if (invoiceScore >= 3) return 'invoice';
  if (financialScore >= 5) return 'financial_statement';
  return 'general_financial';
}

function extractInvoiceData(text) {
  const lines = text.split('\n');
  
  let vendorName = null;
  let invoiceNumber = null;
  let invoiceDate = null;
  let dueDate = null;
  let totalAmount = null;
  const lineItems = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (!vendorName && (trimmed.match(/^vendor|^from|^supplier/i) || INVOICE_KEYWORDS.some(kw => trimmed.toLowerCase().includes(kw)))) {
      const parts = trimmed.split(':');
      if (parts.length > 1) vendorName = parts.slice(1).join(':').trim();
      else vendorName = trimmed;
    }
    
    if (!invoiceNumber && trimmed.match(/invoice\s*(no|number|#)?/i)) {
      const match = trimmed.match(/invoice\s*(?:no|number|#)?\s*:?\s*([a-z0-9-]+)/i);
      if (match) invoiceNumber = match[1];
    }
    
    if (!invoiceDate && trimmed.match(/invoice\s*date|date/i)) {
      const match = trimmed.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
      if (match) invoiceDate = match[1];
    }
    
    if (!dueDate && trimmed.match(/due\s*date|payment\s*due|due/i)) {
      const match = trimmed.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
      if (match) dueDate = match[1];
    }
    
    if (trimmed.match(/total|amount\s*due|grand\s*total/i)) {
      const amounts = extractCurrencyValues(trimmed);
      if (amounts.length > 0) totalAmount = amounts[amounts.length - 1];
    }
  }
  
  return {
    vendorName,
    invoiceNumber,
    invoiceDate,
    dueDate,
    totalAmount,
    lineItems
  };
}

function extractFinancialMetrics(text) {
  const lowerText = text.toLowerCase();
  const metrics = {};
  
  const currencyValues = extractCurrencyValues(text);
  
  if (currencyValues.length > 0) {
    metrics.largestValue = currencyValues[0];
    metrics.smallestValue = currencyValues[currencyValues.length - 1];
  }
  
  const percentages = extractPercentages(text);
  if (percentages.length > 0) {
    metrics.percentagesFound = percentages;
  }
  
  const keywordMetrics = {
    revenue: { keywords: ['revenue', 'sales', 'income'], values: [] },
    expenses: { keywords: ['expense', 'cost', ' expenditure'], values: [] },
    profit: { keywords: ['profit', 'gain', 'earnings'], values: [] },
    assets: { keywords: ['asset', 'property', 'equipment'], values: [] },
    liabilities: { keywords: ['liability', 'debt', 'loan'], values: [] }
  };
  
  for (const [key, data] of Object.entries(keywordMetrics)) {
    for (const kw of data.keywords) {
      const regex = new RegExp(`${kw}[:\\s]+${CURRENCY_REGEX.source}`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        const amounts = extractCurrencyValues(matches.join(' '));
        keywordMetrics[key].values.push(...amounts);
      }
    }
    if (keywordMetrics[key].values.length > 0) {
      metrics[key] = Math.max(...keywordMetrics[key].values);
    }
  }
  
  return metrics;
}

function calculateHealthScore(metrics, documentType) {
  let score = 50;
  let factors = [];
  
  if (documentType === 'invoice') {
    if (metrics.totalAmount) {
      score += 20;
      factors.push('Invoice amount detected');
    }
    if (metrics.invoiceNumber) {
      score += 15;
      factors.push('Invoice number found');
    }
    if (metrics.invoiceDate) {
      score += 10;
      factors.push('Date information present');
    }
  }
  
  if (documentType === 'financial_statement' || documentType === 'general_financial') {
    if (metrics.revenue && metrics.expenses) {
      const margin = ((metrics.revenue - metrics.expenses) / metrics.revenue) * 100;
      if (margin > 20) {
        score += 25;
        factors.push('Strong profit margin detected');
      } else if (margin > 0) {
        score += 15;
        factors.push('Positive margin identified');
      } else {
        score -= 10;
        factors.push('Negative margin detected');
      }
    }
    
    if (metrics.assets && metrics.liabilities) {
      const ratio = metrics.assets / metrics.liabilities;
      if (ratio > 2) {
        score += 20;
        factors.push('Strong asset-liability ratio');
      } else if (ratio > 1) {
        score += 10;
        factors.push('Adequate asset coverage');
      }
    }
  }
  
  score = Math.max(0, Math.min(100, score));
  
  return {
    score,
    grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D',
    factors
  };
}

export function analyzeFinancialDocument(text) {
  if (!text || text.length < 50) {
    return {
      error: 'Document text too short for analysis',
      documentType: null,
      metrics: {},
      healthScore: { score: 0, grade: 'N/A', factors: [] }
    };
  }
  
  const documentType = detectDocumentType(text);
  
  let extractedData = {};
  if (documentType === 'invoice') {
    extractedData = extractInvoiceData(text);
  }
  
  const metrics = extractFinancialMetrics(text);
  const healthScore = calculateHealthScore(metrics, documentType);
  
  const summary = [];
  
  if (documentType === 'invoice') {
    if (extractedData.vendorName) summary.push(`Vendor: ${extractedData.vendorName}`);
    if (extractedData.invoiceNumber) summary.push(`Invoice #: ${extractedData.invoiceNumber}`);
    if (extractedData.totalAmount) summary.push(`Total Amount: $${extractedData.totalAmount.toLocaleString()}`);
  } else {
    if (metrics.revenue) summary.push(`Revenue: $${metrics.revenue.toLocaleString()}`);
    if (metrics.profit) summary.push(`Net Position: $${metrics.profit.toLocaleString()}`);
    if (metrics.assets) summary.push(`Total Assets: $${metrics.assets.toLocaleString()}`);
    if (metrics.liabilities) summary.push(`Total Liabilities: $${metrics.liabilities.toLocaleString()}`);
  }
  
  return {
    documentType,
    extractedData,
    metrics,
    healthScore,
    summary,
    analyzedAt: new Date().toISOString()
  };
}

export default { analyzeFinancialDocument };