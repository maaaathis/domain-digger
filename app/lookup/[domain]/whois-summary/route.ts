import whoiser, { WhoisSearchResult } from 'whoiser';

import isValidDomain from '@/utils/isValidDomain';

export type WhoisSummaryResponse = {
  registrar: string | null;
  createdAt: string | null;
  dnssec: string | null;
};

export type WhoisSummaryErrorResponse = { error: true; message: string };

const getSummary = async (domain: string): Promise<WhoisSummaryResponse> => {
  // TODO Allow resolving for TLDs
  if (!isValidDomain(domain)) {
    return {
      registrar: null,
      createdAt: null,
      dnssec: null,
    };
  }

  try {
    const results = await whoiser(domain, {
      timeout: 5000,
    });

    const resultsKey = Object.keys(results).find(
      // @ts-expect-error
      (key) => !('error' in results[key])
    );
    if (!resultsKey) {
      throw new Error('No valid results found for domain ' + domain);
    }
    const firstResult = results[resultsKey] as WhoisSearchResult;

    return {
      registrar: firstResult['Registrar']?.toString(),
      createdAt:
        firstResult && 'Created Date' in firstResult
          ? new Date(firstResult['Created Date'].toString()).toLocaleDateString(
              'en-US'
            )
          : null,
      dnssec: firstResult['DNSSEC']?.toString(),
    };
  } catch (error) {
    console.error(error);
    return {
      registrar: null,
      createdAt: null,
      dnssec: null,
    };
  }
};

export async function GET(
  _request: Request,
  { params }: { params: { domain: string } }
) {
  if (!params.domain) {
    return Response.json(
      { error: true, message: 'No domain provided' },
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  try {
    const summary = await getSummary(params.domain);
    return Response.json(summary);
  } catch (error) {
    return Response.json(
      { error: true, message: 'Error fetching whois summary' },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
