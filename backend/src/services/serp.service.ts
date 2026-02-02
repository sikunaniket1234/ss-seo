import axios from 'axios';

export class SerpService {
    // Note: In production, move this to a .env file
    private static API_KEY = '1491a8fa5e2db85a3c3a8cff81115c98cd9045ff';

    public static async getGooglePosition(keyword: string, siteUrl: string): Promise<{ position: number; trend: string }> {
        if (!this.API_KEY || this.API_KEY === 'YOUR_SERPER_API_KEY_HERE') {
            throw new Error("Serper API Key is missing. Please add it to SerpService.ts");
        }

        try {
            const data = JSON.stringify({
                "q": keyword,
                "num": 100 // Fetch top 100 results
            });

            const config = {
                method: 'post',
                url: 'https://google.serper.dev/search',
                headers: {
                    'X-API-KEY': this.API_KEY,
                    'Content-Type': 'application/json'
                },
                data: data
            };

            const response = await axios(config);
            const results = response.data.organic || [];

            // Clean the input URL for comparison (remove protocol and trailing slashes)
            const cleanSiteUrl = siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();

            // Find position
            let position = 101; // Not found in top 100
            for (let i = 0; i < results.length; i++) {
                const resultUrl = results[i].link.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();
                if (resultUrl.includes(cleanSiteUrl) || cleanSiteUrl.includes(resultUrl)) {
                    position = i + 1;
                    break;
                }
            }

            return {
                position,
                trend: position <= 10 ? 'up' : (position <= 30 ? 'stable' : 'down')
            };
        } catch (error) {
            console.error("Serper API error:", error);
            throw error;
        }
    }
}
