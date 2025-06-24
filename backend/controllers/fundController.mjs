import User from '../models/User.mjs';

export const saveFund = async (req, res) => {
  const { schemeCode, quantity, purchasePrice } = req.body;
  const userId = req.userId;

  if (schemeCode === undefined || quantity === undefined || purchasePrice === undefined) {
    return res.status(400).json({ message: 'schemeCode, quantity, and purchasePrice are required.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const existingFundIndex = user.savedFunds.findIndex(fund => String(fund.schemeCode) === String(schemeCode));

    if (existingFundIndex > -1) {
      // Fund exists, update it
      user.savedFunds[existingFundIndex].quantity = quantity;
      user.savedFunds[existingFundIndex].purchasePrice = purchasePrice;
      console.log(`🔄 Updated fund ${schemeCode} for user ${userId}`);
    } else {
      // Fund doesn't exist, add it
      user.savedFunds.push({ schemeCode, quantity, purchasePrice });
      console.log(`➕ Added fund ${schemeCode} for user ${userId}`);
    }

    await user.save();
    res.status(200).json({ success: true, message: 'Portfolio updated successfully.', savedFunds: user.savedFunds });

  } catch (error) {
    console.error('❌ Error saving fund:', error);
    res.status(500).json({ message: 'Error saving fund' });
  }
};

export const getFundDetails = async (req, res) => {
  try {
    const { schemeCode } = req.params;
    const response = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
    if (!response.ok) {
      throw new Error(`External API failed with status ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('❌ Error proxying fund details:', error);
    res.status(500).json({ message: 'Error fetching fund details from external API.' });
  }
};

export const getSavedFunds = async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.savedFunds || user.savedFunds.length === 0) {
      return res.json({ 
        totalInvestment: 0,
        currentValue: 0,
        overallGainLoss: 0,
        overallGainLossPercentage: 0,
        funds: [] 
      });
    }

    const portfolioPromises = user.savedFunds.map(async (fund) => {
      try {
        const response = await fetch(`https://api.mfapi.in/mf/${fund.schemeCode}`);
        if (!response.ok) {
          console.error(`Failed to fetch details for ${fund.schemeCode}`);
          return { ...fund, schemeName: 'Unknown Fund', currentNav: 0, error: 'Failed to fetch live data' };
        }
        const liveData = await response.json();
        const currentNav = parseFloat(liveData.data?.[0]?.nav);
        return {
          schemeCode: fund.schemeCode,
          quantity: fund.quantity,
          purchasePrice: fund.purchasePrice,
          schemeName: liveData.meta.scheme_name,
          currentNav: isNaN(currentNav) ? 0 : currentNav,
        };
      } catch (e) {
        console.error(`Error fetching fund ${fund.schemeCode}:`, e);
        return { ...fund, schemeName: 'Unknown Fund', currentNav: 0, error: 'Failed to fetch' };
      }
    });

    const funds = await Promise.all(portfolioPromises);

    // Calculate portfolio metrics
    const totalInvestment = funds.reduce((acc, fund) => acc + (fund.purchasePrice * fund.quantity), 0);
    const currentValue = funds.reduce((acc, fund) => acc + (fund.currentNav * fund.quantity), 0);
    const overallGainLoss = currentValue - totalInvestment;
    const overallGainLossPercentage = totalInvestment > 0 ? (overallGainLoss / totalInvestment) * 100 : 0;

    res.json({
      totalInvestment,
      currentValue,
      overallGainLoss,
      overallGainLossPercentage,
      funds,
    });

  } catch (error) {
    console.error('❌ Error retrieving saved funds:', error);
    res.status(500).json({ message: 'Error retrieving funds' });
  }
};

export const removeSavedFund = async (req, res) => {
  const { schemeCode } = req.params; // Get schemeCode from URL parameters
  const userId = req.userId;

  if (!schemeCode) {
    return res.status(400).json({ message: 'Scheme Code is required' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const initialCount = user.savedFunds.length;
    user.savedFunds = user.savedFunds.filter(fund => String(fund.schemeCode) !== String(schemeCode));

    if (user.savedFunds.length < initialCount) {
      await user.save();
      console.log(`🗑️ Removed fund ${schemeCode} for user ${userId}`);
      res.json({ success: true, message: 'Fund removed successfully', savedFunds: user.savedFunds });
    } else {
      res.status(404).json({ message: 'Fund not found in saved list' });
    }
  } catch (error) {
    console.error('❌ Error removing saved fund:', error);
    res.status(500).json({ message: 'Server error while removing fund' });
  }
};

export const searchFunds = async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ message: 'Query parameter is required' });
  try {
    const response = await fetch(`https://api.mfapi.in/mf/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`External API failed with status ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('❌ Error in live searchFunds:', error);
    res.status(500).json({ message: 'Error searching for funds via external API' });
  }
};
