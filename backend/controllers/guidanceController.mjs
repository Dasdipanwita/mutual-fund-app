// --- Mock Expert Guidance Data ---
const mockGuidance = {
  marketOutlook: {
    title: 'Quarterly Market Outlook',
    summary: 'The market shows strong signs of growth in the technology and healthcare sectors. We recommend a bullish stance on equities, with a focus on large-cap stocks. Geopolitical tensions may introduce volatility, so a diversified portfolio is key.',
    updated: new Date().toISOString(),
  },
  topPicks: [
    { id: 'MF001', name: 'Bluechip Growth Fund', symbol: 'BCGFX', reason: 'Consistently outperforms the market with strong leadership in the tech sector.' },
    { id: 'MF005', name: 'Mid-Cap Momentum Fund', symbol: 'MCMFX', reason: 'High growth potential in an expanding market, suitable for aggressive investors.' },
    { id: 'MF002', name: 'Stable Income Debt Fund', symbol: 'SIDFX', reason: 'A conservative choice for capital preservation with reliable, steady returns.' },
  ],
  strategicAdvice: {
    title: 'Long-Term Investment Strategy',
    points: [
      'Diversify across asset classes (equity, debt, international) to mitigate risk.',
      'Consider a Systematic Investment Plan (SIP) to average out purchase costs over time.',
      'Review your portfolio quarterly and rebalance if your asset allocation deviates significantly.',
      'Stay informed about market trends, but avoid making impulsive decisions based on short-term news.',
    ],
  },
};

export const getExpertGuidance = async (req, res) => {
  try {
    console.log(`✅ Expert guidance requested by user ${req.userId}`);
    // In a real application, this would involve complex logic, AI, or database queries.
    // For now, we return the mock data to any authenticated user.
    res.json(mockGuidance);
  } catch (error) {
    console.error('❌ Error in getExpertGuidance:', error);
    res.status(500).json({ message: 'Error retrieving expert guidance' });
  }
};
