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

    // Initialize company data with symbol
    const companyData: CompanyData = {
      symbol: symbol,
      name: symbol + " Limited", // Default fallback
      description: "",
      financials: {
        annual: [],
        quarterly: [],
      },
    };

    try {
      // Extract company name from quote section
      const companyName = $(".quote__name").text().trim();
      if (companyName) {
        companyData.name = companyName;
      }

      // Extract sector from quote section
      const sectorText = $(".quote__sector span").text().trim();
      if (sectorText) {
        companyData.sector = sectorText;
      }

      // Extract business description from profile section
      const description = $(".profile__item--decription p").text().trim();
      if (description) {
        companyData.description = description;
        companyData.businessDescription = description;
      }

      // Extract website from profile section
      const websiteLink = $('.profile__item a[href*="http"]').attr("href");
      if (websiteLink) {
        companyData.website = websiteLink;
      }

      // Extract address from profile section
      const addressElement = $(".profile__item .item__head")
        .filter((_, el) => $(el).text().trim() === "ADDRESS")
        .next("p");
      if (addressElement.length) {
        companyData.address = addressElement.text().trim();
      }

      // Extract CEO and key people information
      const keyPeople: Array<{ name: string; role: string }> = [];
      $(".profile__item--people .tbl__body tr").each((_, row) => {
        const cells = $(row).find("td");
        if (cells.length >= 2) {
          const name = $(cells[0]).find("strong").text().trim();
          const role = $(cells[1]).text().trim();

          if (name && role) {
            keyPeople.push({ name, role });

            if (
              role.toLowerCase().includes("ceo") ||
              role.toLowerCase().includes("chief executive")
            ) {
              companyData.ceo = name;
            }
          }
        }
      });
      if (keyPeople.length > 0) {
        companyData.keyPeople = keyPeople;
      }

      // Extract financial data from stats section
      $(".stats_item").each((_, item) => {
        const label = $(item).find(".stats_label").text().trim().toLowerCase();
        const value = $(item)
          .find(".stats_value")
          .text()
          .trim()
          .replace(/,/g, "");

        // Parse various financial metrics
        if (label.includes("p/e ratio")) {
          const pe = parseFloat(value);
          if (!isNaN(pe)) companyData.peRatio = pe;
        } else if (label.includes("market cap")) {
          // Extract numeric value from market cap (remove thousands notation)
          const marketCapMatch = value.match(/[\d,.]+/);
          if (marketCapMatch) {
            const marketCap = parseFloat(marketCapMatch[0].replace(/,/g, ""));
            if (!isNaN(marketCap)) companyData.marketCap = marketCap;
          }
        } else if (label.includes("face value")) {
          const face = parseFloat(value);
          if (!isNaN(face)) companyData.faceValue = face;
        } else if (label.includes("lot size")) {
          const lot = parseInt(value, 10);
          if (!isNaN(lot)) companyData.lotSize = lot;
        }
      });

      // Extract comprehensive equity profile data
      const equityProfile: Array<{
        year: string;
        marketCap?: number;
        sharesOutstanding?: number;
        freeFloat?: number;
        bookValue?: number;
        priceToBook?: number;
        dividendPerShare?: number;
        dividendYield?: number;
        earningsPerShare?: number;
        priceEarningsRatio?: number;
        faceValue?: number;
        lotSize?: number;
      }> = [];

      // Extract equity profile data from multiple possible locations
      const equityTables = [
        "#equity table tbody tr",
        ".companyEquity table tbody tr",
        ".equity__profile table tbody tr",
        ".equity-profile table tbody tr",
      ];

      equityTables.forEach((selector) => {
        $(selector).each((_, row) => {
          const cells = $(row).find("td");
          if (cells.length >= 2) {
            const metric = $(cells[0]).text().trim().toLowerCase();

            // Initialize equity profile structure if not done
            if (equityProfile.length === 0) {
              const headers = $(row).closest("table").find("thead th");
              if (headers.length > 1) {
                headers.each((index, header) => {
                  if (index > 0) {
                    const year = $(header).text().trim();
                    if (year && year !== "") {
                      equityProfile.push({ year });
                    }
                  }
                });
              } else {
                // If no header structure, create current year entry
                equityProfile.push({
                  year: new Date().getFullYear().toString(),
                });
              }
            }

            // Extract equity metrics for each year/column
            for (
              let i = 1;
              i < cells.length && i - 1 < equityProfile.length;
              i++
            ) {
              const cellText = $(cells[i]).text().trim();
              const cleanValue = cellText
                .replace(/[(),]/g, "")
                .replace(/,/g, "");
              const numValue = parseFloat(cleanValue);

              if (!isNaN(numValue) && equityProfile[i - 1]) {
                if (metric.includes("market cap")) {
                  equityProfile[i - 1].marketCap = numValue;
                } else if (
                  metric.includes("shares outstanding") ||
                  metric.includes("shares")
                ) {
                  equityProfile[i - 1].sharesOutstanding = numValue;
                } else if (metric.includes("free float")) {
                  // Handle both percentage and count formats
                  if (cellText.includes("%")) {
                    equityProfile[i - 1].freeFloatPercentage = numValue;
                  } else {
                    equityProfile[i - 1].freeFloat = numValue;
                  }
                } else if (metric.includes("book value")) {
                  equityProfile[i - 1].bookValue = numValue;
                } else if (
                  metric.includes("price to book") ||
                  metric.includes("p/b")
                ) {
                  equityProfile[i - 1].priceToBook = numValue;
                } else if (metric.includes("dividend per share")) {
                  equityProfile[i - 1].dividendPerShare = numValue;
                } else if (metric.includes("dividend yield")) {
                  equityProfile[i - 1].dividendYield = numValue;
                } else if (
                  metric.includes("earnings per share") ||
                  metric.includes("eps")
                ) {
                  equityProfile[i - 1].earningsPerShare = numValue;
                } else if (
                  metric.includes("price earnings") ||
                  metric.includes("p/e")
                ) {
                  equityProfile[i - 1].priceEarningsRatio = numValue;
                } else if (metric.includes("face value")) {
                  equityProfile[i - 1].faceValue = numValue;
                } else if (metric.includes("lot size")) {
                  equityProfile[i - 1].lotSize = numValue;
                }
              }
            }
          }
        });
      });

      // Also try to extract equity data from stats cards/items
      $(".equity__stats .stats_item, .companyEquity .stats_item").each(
        (_, item) => {
          const label = $(item)
            .find(".stats_label")
            .text()
            .trim()
            .toLowerCase();
          const value = $(item).find(".stats_value").text().trim();

          // Ensure we have at least one equity profile entry
          if (equityProfile.length === 0) {
            equityProfile.push({ year: new Date().getFullYear().toString() });
          }

          const cleanValue = value.replace(/[(),]/g, "").replace(/,/g, "");
          const numValue = parseFloat(cleanValue);

          if (!isNaN(numValue)) {
            const currentProfile = equityProfile[0];

            if (label.includes("market cap")) {
              currentProfile.marketCap = numValue;
            } else if (
              label.includes("shares") &&
              !label.includes("free float")
            ) {
              currentProfile.sharesOutstanding = numValue;
            } else if (label.includes("free float")) {
              if (value.includes("%")) {
                currentProfile.freeFloat = numValue / 100; // Convert percentage to decimal
              } else {
                currentProfile.freeFloat = numValue;
              }
            } else if (label.includes("book value")) {
              currentProfile.bookValue = numValue;
            } else if (label.includes("face value")) {
              currentProfile.faceValue = numValue;
            } else if (label.includes("lot size")) {
              currentProfile.lotSize = numValue;
            }
          }
        },
      );

      if (equityProfile.length > 0) {
        companyData.equityProfile = equityProfile;
      }

      // Extract current equity profile data from stats items
      $(".companyEquity .stats_item, .equity__stats .stats_item").each(
        (_, item) => {
          const label = $(item)
            .find(".stats_label")
            .text()
            .trim()
            .toLowerCase();
          const value = $(item)
            .find(".stats_value")
            .text()
            .trim()
            .replace(/,/g, "");

          if (label.includes("market cap")) {
            const marketCap = parseFloat(value);
            if (!isNaN(marketCap)) companyData.marketCap = marketCap;
          } else if (
            label.includes("shares") &&
            !label.includes("free float")
          ) {
            const shares = parseFloat(value);
            if (!isNaN(shares)) companyData.sharesOutstanding = shares;
          } else if (label.includes("free float")) {
            const freeFloat = parseFloat(value);
            if (!isNaN(freeFloat)) companyData.freeFloat = freeFloat;
          } else if (label.includes("book value")) {
            const bookValue = parseFloat(value);
            if (!isNaN(bookValue)) companyData.bookValue = bookValue;
          } else if (label.includes("face value")) {
            const faceValue = parseFloat(value);
            if (!isNaN(faceValue)) companyData.faceValue = faceValue;
          } else if (label.includes("lot size")) {
            const lotSize = parseInt(value, 10);
            if (!isNaN(lotSize)) companyData.lotSize = lotSize;
          }
        },
      );

      // Extract 52-week range from range stats
      $(".stats_value").each((_, element) => {
        const text = $(element).text().trim();
        const rangeMatch = text.match(
          /52-WEEK RANGE.*?([\d.]+)\s*—\s*([\d.]+)/i,
        );
        if (rangeMatch) {
          const low = parseFloat(rangeMatch[1]);
          const high = parseFloat(rangeMatch[2]);
          if (!isNaN(low)) companyData.low52Week = low;
          if (!isNaN(high)) companyData.high52Week = high;
        }
      });

      // Extract P/E ratio from stats
      $(".stats_item").each((_, item) => {
        const label = $(item).find(".stats_label").text().trim();
        if (label.includes("P/E Ratio")) {
          const value = $(item).find(".stats_value").text().trim();
          const pe = parseFloat(value);
          if (!isNaN(pe)) companyData.peRatio = pe;
        }
      });

      // Extract dividend yield and other financial ratios from ratios section
      $(".company__ratios .tbl__body tr").each((_, row) => {
        const cells = $(row).find("td");
        if (cells.length >= 2) {
          const metric = $(cells[0]).text().trim().toLowerCase();
          const latestValue = $(cells[1]).text().trim();

          if (metric.includes("dividend yield")) {
            const dividend = parseFloat(latestValue);
            if (!isNaN(dividend)) companyData.dividendYield = dividend;
          } else if (metric.includes("book value")) {
            const book = parseFloat(latestValue);
            if (!isNaN(book)) companyData.bookValue = book;
          } else if (
            metric.includes("p/b ratio") ||
            metric.includes("price to book")
          ) {
            const pb = parseFloat(latestValue);
            if (!isNaN(pb)) companyData.pbRatio = pb;
          } else if (
            metric.includes("p/e ratio") ||
            metric.includes("price earnings")
          ) {
            const pe = parseFloat(latestValue);
            if (!isNaN(pe)) companyData.peRatio = pe;
          } else if (
            metric.includes("roa") ||
            metric.includes("return on assets")
          ) {
            const roa = parseFloat(latestValue);
            if (!isNaN(roa)) companyData.roa = roa;
          } else if (
            metric.includes("roe") ||
            metric.includes("return on equity")
          ) {
            const roe = parseFloat(latestValue);
            if (!isNaN(roe)) companyData.roe = roe;
          } else if (metric.includes("current ratio")) {
            const current = parseFloat(latestValue);
            if (!isNaN(current)) companyData.currentRatio = current;
          } else if (
            metric.includes("debt to equity") ||
            metric.includes("debt/equity")
          ) {
            const debtEquity = parseFloat(latestValue);
            if (!isNaN(debtEquity)) companyData.debtToEquity = debtEquity;
          } else if (
            metric.includes("gross profit margin") ||
            metric.includes("gross margin")
          ) {
            const grossMargin = parseFloat(latestValue);
            if (!isNaN(grossMargin))
              companyData.grossProfitMargin = grossMargin;
          } else if (
            metric.includes("net profit margin") ||
            metric.includes("net margin")
          ) {
            const netMargin = parseFloat(latestValue);
            if (!isNaN(netMargin)) companyData.netProfitMargin = netMargin;
          } else if (metric.includes("operating margin")) {
            const opMargin = parseFloat(latestValue);
            if (!isNaN(opMargin)) companyData.operatingMargin = opMargin;
          } else if (metric.includes("asset turnover")) {
            const assetTurnover = parseFloat(latestValue);
            if (!isNaN(assetTurnover))
              companyData.assetTurnover = assetTurnover;
          } else if (metric.includes("quick ratio")) {
            const quickRatio = parseFloat(latestValue);
            if (!isNaN(quickRatio)) companyData.quickRatio = quickRatio;
          } else if (metric.includes("cash ratio")) {
            const cashRatio = parseFloat(latestValue);
            if (!isNaN(cashRatio)) companyData.cashRatio = cashRatio;
          }
        }
      });

      // Extract dividend and payout information
      $(
        ".company__dividends .tbl__body tr, .dividend__history .tbl__body tr",
      ).each((_, row) => {
        const cells = $(row).find("td");
        if (cells.length >= 3) {
          const year = $(cells[0]).text().trim();
          const dividendPerShare = parseFloat($(cells[1]).text().trim());
          const payoutRatio = parseFloat($(cells[2]).text().trim());

          if (!isNaN(dividendPerShare)) {
            if (!companyData.dividendHistory) companyData.dividendHistory = [];
            companyData.dividendHistory.push({
              year,
              dividendPerShare,
              payoutRatio: !isNaN(payoutRatio) ? payoutRatio : undefined,
            });
          }
        }
      });

      // Extract comprehensive financial data from financials section
      financialEntry: Array<{
        label: string;
        sales?: number;
        profitAfterTax?: number;
        eps?: number;
      }>;
      const financialData: FinancialData = parseFinancialData(html);

      // Enhanced financial data extraction from multiple possible locations
      // $("#financialTab .tabs__panel").each((_, panel) => {
      //   const tabName = $(panel).attr("data-name")?.toLowerCase(); // "annual" or "quarterly"
      //   if (!tabName || !["annual", "quarterly"].includes(tabName)) return;

      //   const labels: string[] = [];

      //   // Extract column headers (years or quarters)
      //   $(panel)
      //     .find("thead tr th")
      //     .each((i, el) => {
      //       if (i === 0) return; // skip first column (metric name)
      //       const text = $(el).text().trim();
      //       if (text) labels.push(text);
      //     });

      //   // Parse rows
      //   $(panel)
      //     .find("tbody tr")
      //     .each((_, row) => {
      //       const cells = $(row).find("td");
      //       const metric = $(cells[0]).text().trim().toLowerCase();

      //       for (let i = 1; i < cells.length; i++) {
      //         const valueText = $(cells[i]).text().trim();
      //         const isNegative =
      //           valueText.includes("(") && valueText.includes(")");
      //         const number = parseFloat(valueText.replace(/[(),]/g, ""));
      //         if (isNaN(number)) continue;

      //         const finalValue = isNegative ? -Math.abs(number) : number;
      //         const label = labels[i - 1];
      //         if (!label) continue;

      //         const entries = financialData[tabName]!;
      //         let entry = entries.find((e) => e.label === label);
      //         if (!entry) {
      //           entry = { label };
      //           entries.push(entry);
      //         }

      //         if (metric.includes("sales") || metric.includes("revenue")) {
      //           entry.sales = finalValue;
      //         } else if (
      //           metric.includes("profit after taxation") ||
      //           metric.includes("net income")
      //         ) {
      //           entry.profitAfterTax = finalValue;
      //         } else if (
      //           metric === "eps" ||
      //           metric.includes("earnings per share")
      //         ) {
      //           entry.eps = finalValue;
      //         }
      //       }
      //     });
      // });

      // Assign to company data
      console.log("Financial Data:", financialData);
      if (financialData.annual?.length || financialData.quarterly?.length) {
        companyData.financialData = financialData;
      }
      // Extract ratios data
      const ratiosData: Array<{
        year: string;
        grossProfitMargin?: number;
        netProfitMargin?: number;
        epsGrowth?: number;
        peg?: number;
      }> = [];

      $("#ratios .tbl__body tr").each((_, row) => {
        const cells = $(row).find("td");
        if (cells.length >= 2) {
          const metric = $(cells[0]).text().trim().toLowerCase();

          // Extract years from header if not done
          if (ratiosData.length === 0) {
            const headers = $(row).closest("table").find("thead th");
            headers.each((index, header) => {
              if (index > 0) {
                const year = $(header).text().trim();
                if (year) {
                  ratiosData.push({ year });
                }
              }
            });
          }

          // Extract ratio metrics for each year
          for (let i = 1; i < cells.length && i - 1 < ratiosData.length; i++) {
            const value = $(cells[i])
              .text()
              .trim()
              .replace(/[()%]/g, "")
              .replace(/,/g, "");
            const numValue = parseFloat(value);

            if (!isNaN(numValue)) {
              if (metric.includes("gross profit margin")) {
                ratiosData[i - 1].grossProfitMargin = numValue;
              } else if (metric.includes("net profit margin")) {
                ratiosData[i - 1].netProfitMargin = numValue;
              } else if (metric.includes("eps growth")) {
                ratiosData[i - 1].epsGrowth = numValue;
              } else if (metric.includes("peg")) {
                ratiosData[i - 1].peg = numValue;
              }
            }
          }
        }
      });

      if (ratiosData.length > 0) {
        companyData.ratiosData = ratiosData;
      }

      // Enhanced dividend and payout extraction from payouts section
      const payoutsData: Array<{
        date: string;
        financialResults?: string;
        details?: string;
        bookClosure?: string;
      }> = [];

      $("#payouts .tbl__body tr").each((_, row) => {
        const cells = $(row).find("td");
        if (cells.length >= 3) {
          const date = $(cells[0]).text().trim();
          const financialResults = $(cells[1]).text().trim();
          const details = $(cells[2]).text().trim();
          const bookClosure =
            cells.length > 3 ? $(cells[3]).text().trim() : undefined;

          if (date) {
            payoutsData.push({
              date,
              financialResults: financialResults || undefined,
              details: details || undefined,
              bookClosure,
            });
          }
        }
      });

      if (payoutsData.length > 0) {
        companyData.payoutsData = payoutsData;
      }

      // Extract announcements data by category
      const announcements: {
        [key: string]: Array<{ date: string; title: string; document: string }>;
      } = {};

      $("#announcements .tabs__panel").each((_, panel) => {
        const panelName = $(panel).attr("data-name");
        if (panelName) {
          const categoryAnnouncements: Array<{
            date: string;
            title: string;
            document: string;
          }> = [];

          $(panel)
            .find(".tbl__body tr")
            .each((_, row) => {
              const cells = $(row).find("td");
              if (cells.length >= 2) {
                const date = $(cells[0]).text().trim();
                const title = $(cells[1]).text().trim();
                const document =
                  this.BASE_URL + $($(cells[2]).find("a")[1]).attr("href") ||
                  "";

                if (date && title) {
                  categoryAnnouncements.push({ date, title, document });
                }
              }
            });

          if (categoryAnnouncements.length > 0) {
            announcements[panelName] = categoryAnnouncements;
          }
        }
      });

      if (Object.keys(announcements).length > 0) {
        companyData.announcements = announcements;
      }

      // Extract additional financial metrics from any remaining financial tables
      $(".financials .tbl__body tr, .financial__ratios .tbl__body tr").each(
        (_, row) => {
          const cells = $(row).find("td");
          if (cells.length >= 2) {
            const metric = $(cells[0]).text().trim().toLowerCase();
            const value = $(cells[1]).text().trim().replace(/,/g, "");
            const numValue = parseFloat(value);

            if (!isNaN(numValue)) {
              if (metric.includes("payout ratio")) {
                companyData.payoutRatio = numValue;
              } else if (metric.includes("retention ratio")) {
                companyData.retentionRatio = numValue;
              } else if (metric.includes("interest coverage")) {
                companyData.interestCoverage = numValue;
              } else if (metric.includes("debt ratio")) {
                companyData.debtRatio = numValue;
              } else if (metric.includes("equity ratio")) {
                companyData.equityRatio = numValue;
              } else if (metric.includes("working capital")) {
                companyData.workingCapital = numValue;
              } else if (
                metric.includes("price to sales") ||
                metric.includes("p/s ratio")
              ) {
                companyData.priceToSales = numValue;
              } else if (
                metric.includes("price to cash flow") ||
                metric.includes("p/cf ratio")
              ) {
                companyData.priceToCashFlow = numValue;
              } else if (metric.includes("enterprise value")) {
                companyData.enterpriseValue = numValue;
              } else if (metric.includes("ev/ebitda")) {
                companyData.evToEbitda = numValue;
              } else if (metric.includes("beta")) {
                companyData.beta = numValue;
              }
            }
          }
        },
      );

      // Extract EPS from financials section
      $(".company__financials .tbl__body tr").each((_, row) => {
        const cells = $(row).find("td");
        if (cells.length >= 2) {
          const metric = $(cells[0]).text().trim().toLowerCase();

          if (metric === "eps") {
            const latestEps = $(cells[1]).text().trim();
            const eps = parseFloat(latestEps);
            if (!isNaN(eps)) companyData.epsRatio = eps;
          }
        }
      });

      // Extract auditor information
      const auditorElement = $(".profile__item .item__head")
        .filter((_, el) => $(el).text().trim() === "AUDITOR")
        .next("p");
      if (auditorElement.length) {
        const auditorInfo = auditorElement.text().trim();
        if (auditorInfo) {
          companyData.auditor = auditorInfo;
        }
      }

      // Extract registrar information
      const registrarElement = $(".profile__item .item__head")
        .filter((_, el) => $(el).text().trim() === "REGISTRAR")
        .next("p");
      if (registrarElement.length) {
        const registrarInfo = registrarElement.text().trim();
        if (registrarInfo) {
          companyData.registrar = registrarInfo;
        }
      }

      // Extract fiscal year end
      const fiscalYearElement = $(".profile__item .item__head")
        .filter((_, el) => $(el).text().trim() === "Fiscal Year End")
        .next("p");
      if (fiscalYearElement.length) {
        const fiscalYear = fiscalYearElement.text().trim();
        if (fiscalYear) {
          companyData.fiscalYearEnd = fiscalYear;
        }
      }

      // Extract phone number
      const phoneElement = $(".profile__item .item__head")
        .filter(
          (_, el) =>
            $(el).text().trim().includes("PHONE") ||
            $(el).text().trim().includes("TEL"),
        )
        .next("p");
      if (phoneElement.length) {
        companyData.phone = phoneElement.text().trim();
      }

      // Try to extract any additional financial metrics from tables
      $("table.tbl tbody tr").each((_, row) => {
        const cells = $(row).find("td");
        if (cells.length >= 2) {
          const label = $(cells[0]).text().trim().toLowerCase();
          const value = $(cells[1]).text().trim().replace(/,/g, "");

          if (label.includes("isin")) {
            companyData.isinCode = value;
          } else if (label.includes("phone") || label.includes("telephone")) {
            companyData.phone = value;
          }
        }
      });

      console.log(`Parsed company data for ${symbol}:`, {
        name: companyData.name,
        sector: companyData.sector,
        marketCap: companyData.marketCap,
        peRatio: companyData.peRatio,
        sharesOutstanding: companyData.sharesOutstanding,
        description: companyData.description?.substring(0, 100) + "...",
        keyPeopleCount: companyData.keyPeople?.length || 0,
        hasAuditor: !!companyData.auditor,
        hasRegistrar: !!companyData.registrar,
        hasFiscalYear: !!companyData.fiscalYearEnd,
      });
    } catch (parseError) {
      console.warn(`Error parsing company data for ${symbol}:`, parseError);
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
type FinancialEntry = {
  label: string;
  sales?: number;
  profitAfterTax?: number;
  eps?: number;
};
type FinancialData = {
  annual: FinancialEntry[];
  quarterly: FinancialEntry[];
};
function parseFinancialData(htmlContent: string): FinancialData {
  const financialData: FinancialData = {
    annual: [],
    quarterly: [],
  };

  // Helper function to parse numerical values from text, handling negative signs and commas
  const parseNumber = (text: string | null | undefined): number | null => {
    if (!text) return null;
    let cleanedText = text.replace(/,/g, ""); // Remove commas
    let value = parseFloat(cleanedText);

    // Check for negative numbers wrapped in parentheses, e.g., "(1.37)"
    if (cleanedText.startsWith("(") && cleanedText.endsWith(")")) {
      value = -parseFloat(cleanedText.substring(1, cleanedText.length - 1));
    }
    return isNaN(value) ? null : value;
  };

  // Load the HTML into cheerio
  const $ = cheerio.load(htmlContent);

  // Generic function to parse a financial table (Annual or Quarterly)

  const parseTable = (
    panelSelector: string,
    dataArray: FinancialEntry[],
    isQuarterly: boolean = false,
  ) => {
    const panel = $(panelSelector);
    const table = panel.find("table");
    const headers: string[] = [];
    const dataMap = new Map<string, FinancialEntry>();

    // Get headers (years or quarters)
    table.find("thead th").each((i, el) => {
      if (i > 0) {
        // Skip the first empty header
        headers.push($(el).text().trim());
      }
    });

    // Initialize map entries with labels
    headers.forEach((header) => {
      dataMap.set(header, { label: header });
    });

    // Extract data rows
    table.find("tbody tr").each((rowIndex, rowEl) => {
      const rowLabel = $(rowEl).find("td").first().text().trim();
      $(rowEl)
        .find("td")
        .slice(1)
        .each((colIndex, colEl) => {
          const header = headers[colIndex];
          const value = parseNumber($(colEl).text().trim());
          const entry = dataMap.get(header);

          if (entry) {
            switch (rowLabel) {
              case "Sales":
                entry.sales = value!;
                break;
              case "Profit after Taxation":
                entry.profitAfterTax = value!;
                break;
              case "EPS":
                entry.eps = value!;
                break;
            }
          }
        });
    });

    // Convert map values to array
    dataArray.push(...Array.from(dataMap.values()));

    // Sort the data
    if (isQuarterly) {
      dataArray.sort((a, b) => {
        const parseQuarterLabel = (qLabel: string) => {
          const parts = qLabel.split(" ");
          const year = parseInt(parts[1]);
          const quarterNum = parseInt(parts[0].replace("Q", ""));
          return { year, quarterNum };
        };

        const aParsed = parseQuarterLabel(a.label);
        const bParsed = parseQuarterLabel(b.label);

        if (aParsed.year !== bParsed.year) {
          return aParsed.year - bParsed.year;
        }
        return aParsed.quarterNum - bParsed.quarterNum;
      });
    } else {
      dataArray.sort((a, b) => parseInt(a.label) - parseInt(b.label));
    }
  };

  // Parse Annual Data
  parseTable(
    '#financialTab .tabs__panel[data-name="Annual"]',
    financialData.annual,
  );

  // Parse Quarterly Data
  parseTable(
    '#financialTab .tabs__panel[data-name="Quarterly"]',
    financialData.quarterly,
    true,
  );

  return financialData;
}
