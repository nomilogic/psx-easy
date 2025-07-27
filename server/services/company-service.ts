
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import type { CompanyData } from "@shared/schema";

const CORS_PROXIES = [
  "https://corsproxy.io/?",
  "https://cors-anywhere.herokuapp.com/",
  "https://api.allorigins.win/raw?url=",
];

export class CompanyService {
  private static readonly BASE_URL = "https://dps.psx.com.pk";
  private static readonly COMPANY_URL = `${CompanyService.BASE_URL}/company`;

  private static async fetchWithRetry(url: string): Promise<string> {
    if (!url) {
      throw new Error("URL is null or undefined");
    }

    for (const proxy of CORS_PROXIES) {
      try {
        const response = await fetch(`${proxy}${encodeURIComponent(url)}`, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.text();
        if (!data) {
          throw new Error("No data in response");
        }

        return data;
      } catch (error) {
        console.warn(`Attempt with proxy ${proxy} failed:`, error);
        continue;
      }
    }
    throw new Error("All proxy attempts failed");
  }

  static async fetchCompanyData(symbol: string): Promise<CompanyData | null> {
    try {
      const url = `${this.COMPANY_URL}/${symbol.toUpperCase()}`;
      const html = await this.fetchWithRetry(url);
      return this.parseCompanyHTML(html, symbol.toUpperCase());
    } catch (error) {
      console.error(`Error fetching company data for ${symbol}:`, error);
      return null;
    }
  }

  private static parseCompanyHTML(html: string, symbol: string): CompanyData {
    const $ = cheerio.load(html);
    
    // Initialize company data with symbol
    const companyData: CompanyData = {
      symbol: symbol,
      name: symbol + " Limited", // Default fallback
    };

    try {
      // Extract company name
      const companyName = $('.company-name, .companyName, h1.page-title, .page-header h1').first().text().trim();
      if (companyName) {
        companyData.name = companyName;
      }

      // Extract sector
      const sectorText = $('.sector, .company-sector, .breadcrumb').text().trim();
      if (sectorText) {
        companyData.sector = sectorText;
      }

      // Extract company description
      const description = $('.company-description, .company-profile, .about-company').first().text().trim();
      if (description) {
        companyData.description = description;
      }

      // Extract contact information
      const website = $('a[href*="http"]').first().attr('href');
      if (website) {
        companyData.website = website;
      }

      // Extract financial data from tables
      $('.company-info tr, .financial-data tr, .key-stats tr').each((_, row) => {
        const cells = $(row).find('td, th');
        if (cells.length >= 2) {
          const label = $(cells[0]).text().trim().toLowerCase();
          const value = $(cells[1]).text().trim().replace(/,/g, '');

          // Parse financial metrics
          if (label.includes('market cap')) {
            const marketCap = parseFloat(value);
            if (!isNaN(marketCap)) companyData.marketCap = marketCap;
          } else if (label.includes('shares outstanding')) {
            const shares = parseInt(value, 10);
            if (!isNaN(shares)) companyData.sharesOutstanding = shares;
          } else if (label.includes('p/e ratio') || label.includes('pe ratio')) {
            const pe = parseFloat(value);
            if (!isNaN(pe)) companyData.peRatio = pe;
          } else if (label.includes('p/b ratio') || label.includes('pb ratio')) {
            const pb = parseFloat(value);
            if (!isNaN(pb)) companyData.pbRatio = pb;
          } else if (label.includes('dividend yield')) {
            const dividend = parseFloat(value);
            if (!isNaN(dividend)) companyData.dividendYield = dividend;
          } else if (label.includes('eps')) {
            const eps = parseFloat(value);
            if (!isNaN(eps)) companyData.epsRatio = eps;
          } else if (label.includes('book value')) {
            const book = parseFloat(value);
            if (!isNaN(book)) companyData.bookValue = book;
          } else if (label.includes('52 week high') || label.includes('52w high')) {
            const high = parseFloat(value);
            if (!isNaN(high)) companyData.high52Week = high;
          } else if (label.includes('52 week low') || label.includes('52w low')) {
            const low = parseFloat(value);
            if (!isNaN(low)) companyData.low52Week = low;
          } else if (label.includes('face value')) {
            const face = parseFloat(value);
            if (!isNaN(face)) companyData.faceValue = face;
          } else if (label.includes('lot size')) {
            const lot = parseInt(value, 10);
            if (!isNaN(lot)) companyData.lotSize = lot;
          } else if (label.includes('isin')) {
            companyData.isinCode = value;
          } else if (label.includes('ceo') || label.includes('chief executive')) {
            companyData.ceo = value;
          } else if (label.includes('phone') || label.includes('telephone')) {
            companyData.phone = value;
          } else if (label.includes('address')) {
            companyData.address = value;
          }
        }
      });

      // Try alternative selectors for financial data
      $('.data-value, .metric-value, .stat-value').each((_, element) => {
        const parentLabel = $(element).siblings('.data-label, .metric-label, .stat-label').text().toLowerCase();
        const value = $(element).text().trim().replace(/,/g, '');
        
        if (parentLabel.includes('market cap')) {
          const marketCap = parseFloat(value);
          if (!isNaN(marketCap)) companyData.marketCap = marketCap;
        }
        // Add more parsing as needed
      });

    } catch (parseError) {
      console.warn(`Error parsing company data for ${symbol}:`, parseError);
    }

    return companyData;
  }

  static async fetchAllCompaniesData(): Promise<CompanyData[]> {
    try {
      // First get all symbols from the PSX symbols endpoint
      const symbolsUrl = "https://dps.psx.com.pk/symbols";
      const symbolsResponse = await this.fetchWithRetry(symbolsUrl);
      const symbols = JSON.parse(symbolsResponse) as Array<{symbol: string, name: string}>;
      
      console.log(`Found ${symbols.length} companies to fetch data for`);
      
      const companies: CompanyData[] = [];
      
      // Fetch company data for each symbol (with rate limiting)
      for (let i = 0; i < symbols.length; i++) {
        const symbol = symbols[i].symbol;
        console.log(`Fetching company data for ${symbol} (${i + 1}/${symbols.length})`);
        
        try {
          const companyData = await this.fetchCompanyData(symbol);
          if (companyData) {
            companies.push(companyData);
          }
          
          // Add delay to avoid overwhelming the server
          if (i < symbols.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
          }
        } catch (error) {
          console.error(`Failed to fetch data for ${symbol}:`, error);
          continue;
        }
      }
      
      return companies;
    } catch (error) {
      console.error("Error fetching all companies data:", error);
      return [];
    }
  }
}
