import puppeteer, { Browser, Page, Cookie } from 'puppeteer';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

class LinkedInScraper {
    private browser: Browser | null = null;
    private page: Page | null = null;
    private readonly email: string;
    private readonly password: string;
    private readonly cookiesFilePath: string;

    constructor() {
        this.email = process.env.LINKEDIN_EMAIL || '';
        this.password = process.env.LINKEDIN_PASSWORD || '';
        this.cookiesFilePath = path.resolve(__dirname, 'cookies.json');
    }

    // Launch the browser and create a new page
    async launchBrowser(headless = true): Promise<void> {
        this.browser = await puppeteer.launch({
            executablePath: '/snap/bin/chromium',
            headless,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        this.page = await this.browser.newPage();
        this.page.setDefaultTimeout(400 * 1000);
        // Load cookies if they exist
        await this.loadCookies();
    }

    // Log in to LinkedIn
    async login(): Promise<void> {
        if (!this.page) throw new Error('Browser has not been launched.');

        await this.page.goto('https://www.linkedin.com/checkpoint/lg/sign-in-another-account', { waitUntil: 'networkidle2' });
        console.log('Navigating to LinkedIn login page...');

        // Type email and password
        await this.page.type('#username', this.email, { delay: 100 });
        await this.page.type('#password', this.password, { delay: 100 });

        // Click login and wait for navigation
        await this.page.click('[type="submit"]');

            await delay(20 * 1000);

        console.log('Successfully logged in to LinkedIn!');
        // Save cookies after login
        await this.saveCookies();
    }

    // Save cookies to a file
    async saveCookies(): Promise<void> {
        if (!this.page) throw new Error('Page has not been initialized.');

        const cookies = await this.page.cookies();
        fs.writeFileSync(this.cookiesFilePath, JSON.stringify(cookies, null, 2));
        console.log('Cookies saved to', this.cookiesFilePath);
    }

    // Load cookies from a file, if they exist
    async loadCookies(): Promise<void> {
        if (fs.existsSync(this.cookiesFilePath) && this.page) {
            const cookiesString = fs.readFileSync(this.cookiesFilePath, 'utf-8');
            const cookies: Cookie[] = JSON.parse(cookiesString);
            await this.page.setCookie(...cookies);
            console.log('Cookies loaded from', this.cookiesFilePath);
        }
    }

    // Navigate to a specific LinkedIn page using saved cookies
    async navigateToProfile(): Promise<void> {
        if (!this.page) throw new Error('Browser has not been launched.');

        await this.page.goto('https://www.linkedin.com/in/');
        await delay(5 * 1000);
        console.log('Navigated to LinkedIn profile page');
    }

    async navigateToJobPost(): Promise<void> {
        if (!this.page) throw new Error('Browser has not been launched.');

        await this.page.goto('https://www.linkedin.com/job-posting/?trk=nav_biz_serv_job_post_nept');
        await delay(5 * 1000);
        console.log('Navigated to LinkedIn profile page');
    }

    // Close the browser
    async closeBrowser(): Promise<void> {
        console.log("Close Browser");
        if (this.browser) {
            await this.browser.close();
            console.log('Browser closed');
        }
    }
}

const delay = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

// Example usage
(async () => {
    const scraper = new LinkedInScraper();

    //await scraper.launchBrowser(false); // Set to false to see the browser in action
    // await scraper.login(); // Perform login and save cookies
    // await delay(30 * 1000);
    // await scraper.closeBrowser(); // Close the browser after navigation
    await scraper.launchBrowser(false); // Set to false to see the browser in action
    await scraper.navigateToProfile(); // Navigate to profile page using cookies
    await delay(5 * 1000);
    await scraper.closeBrowser();
    await delay(5 * 1000);
    await scraper.launchBrowser(false); 
    await scraper.navigateToJobPost();
    await delay(5 * 1000);
    await scraper.closeBrowser();

})();
