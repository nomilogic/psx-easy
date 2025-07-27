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
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(`${proxy}${encodeURIComponent(url)}`, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

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
      const upperSymbol = symbol.toUpperCase();
      const url = `${this.COMPANY_URL}/${upperSymbol}`;
      console.log(`Attempting to fetch company data from: ${url}`);

      const html = await this.fetchWithRetry(url);
      console.log(
        `Successfully fetched HTML for ${upperSymbol}, length: ${html.length}`,
        html,
      );

      const companyData = this.parseCompanyHTML(html, upperSymbol);
      console.log(`Parsed company data for ${upperSymbol}:`, {
        name: companyData.name,
        sector: companyData.sector,
        hasDescription: !!companyData.description,
        hasWebsite: !!companyData.website,
      });

      return companyData;
    } catch (error) {
      console.error(`Error fetching company data for ${symbol}:`, error);
      return null;
    }
  }

  // private static parseCompanyHTML(html: string, symbol: string): CompanyData {
  //   const $ = cheerio.load(html);

  //   // Initialize company data with symbol
  //   const companyData: CompanyData = {
  //     symbol: symbol,
  //     name: symbol + " Limited", // Default fallback
  //   };

  //   try {
  //     // Extract company name from quote section
  //     const companyName = $(".quote__name").text().trim();
  //     if (companyName) {
  //       companyData.name = companyName;
  //     }

  //     // Extract sector from quote section
  //     const sectorText = $(".quote__sector span").text().trim();
  //     if (sectorText) {
  //       companyData.sector = sectorText;
  //     }

  //     // Extract business description from profile section
  //     const description = $(".profile__item--decription p").text().trim();
  //     if (description) {
  //       companyData.description = description;
  //     }

  //     // Extract website from profile section
  //     const websiteLink = $('.profile__item a[href*="http"]').attr("href");
  //     if (websiteLink) {
  //       companyData.website = websiteLink;
  //     }

  //     // Extract address from profile section
  //     const addressElement = $(".profile__item .item__head")
  //       .filter((_, el) => $(el).text().trim() === "ADDRESS")
  //       .next("p");
  //     if (addressElement.length) {
  //       companyData.address = addressElement.text().trim();
  //     }

  //     // Extract CEO and key people information
  //     $(".profile__item--people .tbl__body tr").each((_, row) => {
  //       const cells = $(row).find("td");
  //       if (cells.length >= 2) {
  //         const name = $(cells[0]).find("strong").text().trim();
  //         const role = $(cells[1]).text().trim().toLowerCase();

  //         if (role.includes("ceo") || role.includes("chief executive")) {
  //           companyData.ceo = name;
  //         }
  //       }
  //     });

  //     // Extract financial data from stats section
  //     $(".stats_item").each((_, item) => {
  //       const label = $(item).find(".stats_label").text().trim().toLowerCase();
  //       const value = $(item)
  //         .find(".stats_value")
  //         .text()
  //         .trim()
  //         .replace(/,/g, "");

  //       // Parse various financial metrics
  //       if (label.includes("p/e ratio")) {
  //         const pe = parseFloat(value);
  //         if (!isNaN(pe)) companyData.peRatio = pe;
  //       } else if (label.includes("market cap")) {
  //         // Extract numeric value from market cap (remove thousands notation)
  //         const marketCapMatch = value.match(/[\d,.]+/);
  //         if (marketCapMatch) {
  //           const marketCap = parseFloat(marketCapMatch[0].replace(/,/g, ""));
  //           if (!isNaN(marketCap)) companyData.marketCap = marketCap;
  //         }
  //       }
  //     });

  //     // Extract equity profile data
  //     $(".companyEquity .stats_item").each((_, item) => {
  //       const label = $(item).find(".stats_label").text().trim().toLowerCase();
  //       const value = $(item)
  //         .find(".stats_value")
  //         .text()
  //         .trim()
  //         .replace(/,/g, "");

  //       if (label.includes("market cap")) {
  //         const marketCap = parseFloat(value);
  //         if (!isNaN(marketCap)) companyData.marketCap = marketCap;
  //       } else if (label.includes("shares") && !label.includes("free float")) {
  //         const shares = parseFloat(value);
  //         if (!isNaN(shares)) companyData.sharesOutstanding = shares;
  //       }
  //     });

  //     // Extract 52-week range from range stats
  //     $(".stats_value").each((_, element) => {
  //       const text = $(element).text().trim();
  //       const rangeMatch = text.match(
  //         /52-WEEK RANGE.*?([\d.]+)\s*—\s*([\d.]+)/i,
  //       );
  //       if (rangeMatch) {
  //         const low = parseFloat(rangeMatch[1]);
  //         const high = parseFloat(rangeMatch[2]);
  //         if (!isNaN(low)) companyData.low52Week = low;
  //         if (!isNaN(high)) companyData.high52Week = high;
  //       }
  //     });

  //     // Extract P/E ratio from stats
  //     $(".stats_item").each((_, item) => {
  //       const label = $(item).find(".stats_label").text().trim();
  //       if (label.includes("P/E Ratio")) {
  //         const value = $(item).find(".stats_value").text().trim();
  //         const pe = parseFloat(value);
  //         if (!isNaN(pe)) companyData.peRatio = pe;
  //       }
  //     });

  //     // Extract dividend yield and other financial ratios from ratios section
  //     $(".company__ratios .tbl__body tr").each((_, row) => {
  //       const cells = $(row).find("td");
  //       if (cells.length >= 2) {
  //         const metric = $(cells[0]).text().trim().toLowerCase();
  //         const latestValue = $(cells[1]).text().trim();

  //         if (metric.includes("dividend yield")) {
  //           const dividend = parseFloat(latestValue);
  //           if (!isNaN(dividend)) companyData.dividendYield = dividend;
  //         } else if (metric.includes("book value")) {
  //           const book = parseFloat(latestValue);
  //           if (!isNaN(book)) companyData.bookValue = book;
  //         }
  //       }
  //     });

  //     // Extract EPS from financials section
  //     $(".company__financials .tbl__body tr").each((_, row) => {
  //       const cells = $(row).find("td");
  //       if (cells.length >= 2) {
  //         const metric = $(cells[0]).text().trim().toLowerCase();

  //         if (metric === "eps") {
  //           const latestEps = $(cells[1]).text().trim();
  //           const eps = parseFloat(latestEps);
  //           if (!isNaN(eps)) companyData.epsRatio = eps;
  //         }
  //       }
  //     });

  //     // Extract auditor information
  //     const auditorElement = $(".profile__item .item__head")
  //       .filter((_, el) => $(el).text().trim() === "AUDITOR")
  //       .next("p");
  //     if (auditorElement.length) {
  //       // Store auditor info in description if not already present
  //       const auditorInfo = auditorElement.text().trim();
  //       if (auditorInfo && companyData.description) {
  //         companyData.description += `\n\nAuditor: ${auditorInfo}`;
  //       }
  //     }

  //     // Extract registrar information
  //     const registrarElement = $(".profile__item .item__head")
  //       .filter((_, el) => $(el).text().trim() === "REGISTRAR")
  //       .next("p");
  //     if (registrarElement.length) {
  //       const registrarInfo = registrarElement.text().trim();
  //       if (registrarInfo && companyData.description) {
  //         companyData.description += `\n\nRegistrar: ${registrarInfo}`;
  //       }
  //     }

  //     // Extract fiscal year end
  //     const fiscalYearElement = $(".profile__item .item__head")
  //       .filter((_, el) => $(el).text().trim() === "Fiscal Year End")
  //       .next("p");
  //     if (fiscalYearElement.length) {
  //       const fiscalYear = fiscalYearElement.text().trim();
  //       if (fiscalYear && companyData.description) {
  //         companyData.description += `\n\nFiscal Year End: ${fiscalYear}`;
  //       }
  //     }

  //     // Extract face value and lot size (if available in stats)
  //     $(".stats_item").each((_, item) => {
  //       const label = $(item).find(".stats_label").text().trim().toLowerCase();
  //       const value = $(item)
  //         .find(".stats_value")
  //         .text()
  //         .trim()
  //         .replace(/,/g, "");

  //       if (label.includes("face value")) {
  //         const face = parseFloat(value);
  //         if (!isNaN(face)) companyData.faceValue = face;
  //       } else if (label.includes("lot size")) {
  //         const lot = parseInt(value, 10);
  //         if (!isNaN(lot)) companyData.lotSize = lot;
  //       }
  //     });

  //     // Try to extract any additional financial metrics from tables
  //     $("table.tbl tbody tr").each((_, row) => {
  //       const cells = $(row).find("td");
  //       if (cells.length >= 2) {
  //         const label = $(cells[0]).text().trim().toLowerCase();
  //         const value = $(cells[1]).text().trim().replace(/,/g, "");

  //         if (label.includes("isin")) {
  //           companyData.isinCode = value;
  //         } else if (label.includes("phone") || label.includes("telephone")) {
  //           companyData.phone = value;
  //         }
  //       }
  //     });

  //     console.log(`Parsed company data for ${symbol}:`, {
  //       name: companyData.name,
  //       sector: companyData.sector,
  //       marketCap: companyData.marketCap,
  //       peRatio: companyData.peRatio,
  //       sharesOutstanding: companyData.sharesOutstanding,
  //       description: companyData.description?.substring(0, 100) + "...",
  //     });
  //   } catch (parseError) {
  //     console.warn(`Error parsing company data for ${symbol}:`, parseError);
  //   }

  //   return companyData;
  // }

  private static parseCompanyHTML(html: string, symbol: string): CompanyData {
    const $ = cheerio.load(html);

    // Initialize company data
    const companyData: CompanyData = {
      symbol: symbol,
      name: "",
      description: "",
    };

    try {
      // Extract company name
      const companyName = $(".quote__name").text().trim();
      if (companyName) companyData.name = companyName;

      // Extract sector
      const sectorText = $(".quote__sector span").text().trim();
      if (sectorText) companyData.sector = sectorText;

      // Extract description
      const description = $(".profile__item--decription p").text().trim();
      if (description) companyData.description = description;

      // Extract website
      const websiteLink = $('.profile__item a[href*="http"]').attr("href");
      if (websiteLink) companyData.website = websiteLink;

      // Extract address
      const addressElement = $(".profile__item .item__head")
        .filter((_, el) => $(el).text().trim() === "ADDRESS")
        .next("p");
      if (addressElement.length)
        companyData.address = addressElement.text().trim();

      // Extract CEO
      $(".profile__item--people .tbl__body tr").each((_, row) => {
        const cells = $(row).find("td");
        if (cells.length >= 2) {
          const name = $(cells[0]).find("strong").text().trim();
          const role = $(cells[1]).text().trim().toLowerCase();
          if (role.includes("ceo") || role.includes("chief executive")) {
            companyData.ceo = name;
          }
        }
      });

      // Extract market cap
      $(".stats_item").each((_, item) => {
        const label = $(item).find(".stats_label").text().trim().toLowerCase();
        const value = $(item)
          .find(".stats_value")
          .text()
          .trim()
          .replace(/,/g, "");
        if (label.includes("market cap")) {
          const marketCap = parseFloat(value);
          if (!isNaN(marketCap)) companyData.marketCap = marketCap;
        }
      });

      // Extract auditor info
      const auditor = $(".profile__item .item__head")
        .filter((_, el) => $(el).text().trim() === "AUDITOR")
        .next("p")
        .text()
        .trim();
      if (auditor) companyData.auditor = auditor;

      // Extract registrar info
      const registrar = $(".profile__item .item__head")
        .filter((_, el) => $(el).text().trim() === "REGISTRAR")
        .next("p")
        .text()
        .trim();
      if (registrar) companyData.registrar = registrar;

      // Additional extraction logic can go here...
    } catch (error) {
      console.warn(`Error parsing HTML for ${symbol}:`, error);
    }

    return companyData;
  }
  static async fetchAllCompaniesData(): Promise<CompanyData[]> {
    try {
      // First get all symbols from the PSX symbols endpoint
      const symbolsUrl = `${this.BASE_URL}/symbols`;
      const symbolsResponse = await this.fetchWithRetry(symbolsUrl);
      const symbols = JSON.parse(symbolsResponse) as Array<{
        symbol: string;
        name: string;
      }>;

      console.log(`Found ${symbols.length} companies to fetch data for`);

      const companies: CompanyData[] = [];

      // Fetch company data for each symbol (with rate limiting)
      for (let i = 0; i < symbols.length; i++) {
        const symbol = symbols[i].symbol;
        console.log(
          `Fetching company data for ${symbol} (${i + 1}/${symbols.length})`,
        );

        try {
          const companyData = await this.fetchCompanyData(symbol);
          if (companyData) {
            companies.push(companyData);
            console.log(`Successfully fetched data for ${symbol}`);
          }

          // Add delay to avoid overwhelming the server
          if (i < symbols.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second delay
          }
        } catch (error) {
          console.error(`Failed to fetch data for ${symbol}:`, error);
          continue;
        }
      }

      console.log(
        `Successfully fetched data for ${companies.length} out of ${symbols.length} companies`,
      );
      return companies;
    } catch (error) {
      console.error("Error fetching all companies data:", error);
      return [];
    }
  }
}
