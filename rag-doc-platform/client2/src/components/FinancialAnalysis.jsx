import React, { useState, useEffect } from 'react';
import { analyzeFinancial } from '../services/api';

const DOC_TYPE_LABELS = {
  invoice: 'Invoice',
  financial_statement: 'Financial Statement',
  general_financial: 'Financial Document'
};

const GRADE_COLORS = {
  A: 'bg-green-600',
  B: 'bg-blue-500',
  C: 'bg-yellow-500',
  D: 'bg-red-500',
  'N/A': 'bg-gray-400'
};

export default function FinancialAnalysis({ docInfo }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (docInfo?.text) {
      analyzeDoc();
    }
  }, [docInfo]);

  const analyzeDoc = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeFinancial(docInfo.text, docInfo.category);
      setAnalysis(result);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  if (!docInfo) {
    return (
      <div className="rounded-generous border border-borderCream bg-ivory p-8 text-center shadow-whisper">
        <div className="text-4xl mb-3">📊</div>
        <h2 className="text-xl font-serif text-midnight mb-2">Financial Analysis</h2>
        <p className="text-stone">Upload a financial document to see analysis</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-generous border border-borderCream bg-ivory p-8 text-center shadow-whisper">
        <div className="flex justify-center gap-1 mb-3">
          <div className="w-3 h-3 rounded-full bg-terracotta animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 rounded-full bg-terracotta animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 rounded-full bg-terracotta animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="text-stone">Analyzing document...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-generous border border-red-300 bg-red-50 p-6 shadow-whisper">
        <h3 className="text-red-700 font-medium mb-2">Analysis Error</h3>
        <p className="text-red-600 text-sm">{error}</p>
        <button 
          onClick={analyzeDoc}
          className="mt-4 px-4 py-2 bg-terracotta text-ivory rounded-comfortable text-sm hover:bg-terracotta-dark"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analysis) return null;

  const { documentType, extractedData, metrics, healthScore, summary } = analysis;

  return (
    <div className="space-y-6">
      <div className="rounded-generous border border-borderCream bg-ivory p-6 shadow-whisper">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-serif text-midnight">Financial Analysis</h2>
          <span className="px-3 py-1 bg-terracotta/10 text-terracotta rounded-full text-sm font-medium">
            {DOC_TYPE_LABELS[documentType] || 'Financial Document'}
          </span>
        </div>

        <div className="flex items-center gap-6 p-4 bg-parchment rounded-comfortable">
          <div className={`w-16 h-16 rounded-full ${GRADE_COLORS[healthScore.grade]} flex items-center justify-center text-ivory text-2xl font-bold`}>
            {healthScore.grade}
          </div>
          <div>
            <div className="text-2xl font-bold text-midnight">{healthScore.score}/100</div>
            <div className="text-stone text-sm">Health Score</div>
          </div>
        </div>

        {healthScore.factors.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {healthScore.factors.map((factor, idx) => (
              <span key={idx} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                {factor}
              </span>
            ))}
          </div>
        )}
      </div>

      {documentType === 'invoice' && extractedData && (
        <div className="rounded-generous border border-borderCream bg-ivory p-6 shadow-whisper">
          <h3 className="text-lg font-serif text-midnight mb-4">Invoice Details</h3>
          <div className="grid grid-cols-2 gap-4">
            {extractedData.vendorName && (
              <div>
                <div className="text-stone text-xs uppercase">Vendor</div>
                <div className="text-midnight font-medium">{extractedData.vendorName}</div>
              </div>
            )}
            {extractedData.invoiceNumber && (
              <div>
                <div className="text-stone text-xs uppercase">Invoice #</div>
                <div className="text-midnight font-medium">{extractedData.invoiceNumber}</div>
              </div>
            )}
            {extractedData.invoiceDate && (
              <div>
                <div className="text-stone text-xs uppercase">Date</div>
                <div className="text-midnight font-medium">{extractedData.invoiceDate}</div>
              </div>
            )}
            {extractedData.dueDate && (
              <div>
                <div className="text-stone text-xs uppercase">Due Date</div>
                <div className="text-midnight font-medium">{extractedData.dueDate}</div>
              </div>
            )}
            {extractedData.totalAmount && (
              <div className="col-span-2">
                <div className="text-stone text-xs uppercase">Total Amount</div>
                <div className="text-2xl font-bold text-terracotta">${extractedData.totalAmount.toLocaleString()}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {(documentType === 'financial_statement' || documentType === 'general_financial') && (
        <div className="rounded-generous border border-borderCream bg-ivory p-6 shadow-whisper">
          <h3 className="text-lg font-serif text-midnight mb-4">Key Financial Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.revenue && (
              <div className="p-4 bg-parchment rounded-comfortable">
                <div className="text-stone text-xs uppercase">Revenue</div>
                <div className="text-lg font-bold text-midnight">${metrics.revenue.toLocaleString()}</div>
              </div>
            )}
            {metrics.expenses && (
              <div className="p-4 bg-parchment rounded-comfortable">
                <div className="text-stone text-xs uppercase">Expenses</div>
                <div className="text-lg font-bold text-midnight">${metrics.expenses.toLocaleString()}</div>
              </div>
            )}
            {metrics.profit !== undefined && (
              <div className="p-4 bg-parchment rounded-comfortable">
                <div className="text-stone text-xs uppercase">Net Position</div>
                <div className={`text-lg font-bold ${metrics.profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  ${metrics.profit.toLocaleString()}
                </div>
              </div>
            )}
            {metrics.assets && (
              <div className="p-4 bg-parchment rounded-comfortable">
                <div className="text-stone text-xs uppercase">Assets</div>
                <div className="text-lg font-bold text-midnight">${metrics.assets.toLocaleString()}</div>
              </div>
            )}
            {metrics.liabilities && (
              <div className="p-4 bg-parchment rounded-comfortable">
                <div className="text-stone text-xs uppercase">Liabilities</div>
                <div className="text-lg font-bold text-midnight">${metrics.liabilities.toLocaleString()}</div>
              </div>
            )}
            {metrics.largestValue && (
              <div className="p-4 bg-parchment rounded-comfortable">
                <div className="text-stone text-xs uppercase">Largest Value</div>
                <div className="text-lg font-bold text-midnight">${metrics.largestValue.toLocaleString()}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {summary.length > 0 && (
        <div className="rounded-generous border border-borderCream bg-ivory p-6 shadow-whisper">
          <h3 className="text-lg font-serif text-midnight mb-4">Summary</h3>
          <ul className="space-y-2">
            {summary.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 text-midnight">
                <span className="text-terracotta">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}