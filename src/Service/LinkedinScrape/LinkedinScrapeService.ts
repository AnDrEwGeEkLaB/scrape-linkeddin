import puppeteer, { Browser, Cookie, KeyInput, Page } from "puppeteer";
const delay = async (time: number) => {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

export default class LinkedInScraperService {
    private browser: Browser | null = null;
    private page: Page | null = null;
    async launchBrowser(): Promise<void> {
        this.browser = await puppeteer.launch({
            headless: false,
            args: [
                '--disable-http2',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--enable-features=NetworkService,NetworkServiceInProcess',
            ],
            defaultViewport: { width: 1920, height: 1080 }
        });
        this.page = await this.browser.newPage();
        this.page.setDefaultTimeout(400 * 1000);
    }


    // Log in to LinkedIn
    async login(email: string, password: string): Promise<void> {
        if (!this.page) throw new Error('Browser has not been launched.');
        await this.page.goto('https://www.linkedin.com/checkpoint/lg/sign-in-another-account', {
            waitUntil: "domcontentloaded",
        });
        // Log in to LinkedIn
        await delay(5000);
        console.log('Navigating to LinkedIn login page...');
        // Type email and password
        await this.page.type('#username', email, { delay: 100 });
        await this.page.type('#password', password, { delay: 100 });
        // Click login and wait for navigation
        await this.page.click('[type="submit"]');
        console.log("Clicked on submit button");
        await delay(15000);
        console.log('Successfully logged in to LinkedIn!');
    }
    // Save cookies to a file
    async getCookies(): Promise<Cookie[]> {
        if (!this.page) throw new Error('Page has not been initialized.');
        const cookies = await this.page.cookies();
        return cookies;
    }
    // Load cookies from a file, if they exist
    async loadCookies(cookies: Cookie[]): Promise<void> {
        if (this.page) {
            await this.page.goto('https://www.linkedin.com', { waitUntil: 'domcontentloaded' });
            await this.page.setCookie(...cookies);
            await delay(10000);
            console.log('Cookies set successfully');
        }
    }
    // Navigate to a specific LinkedIn page using saved cookies
    async checkProfile(): Promise<string> {
        if (!this.page) throw new Error('Browser has not been launched.');
        console.log("Enter Here")
        await this.page.goto('https://www.linkedin.com/in/');
        await delay(5000);
        const url = this.page.url();
        console.log('Navigated to LinkedIn profile page', url);
        return url;
    }
    async checkWhichForm(): Promise<string> {
        if (!this.page) throw new Error('Browser has not been launched.');
        console.log('Navigated to LinkedIn check Which Form');
        await this.page.goto('https://www.linkedin.com/job-posting/?trk=nav_biz_serv_job_post_nept', { waitUntil: "domcontentloaded" });
        await delay(5000);
        const checkFormOne = await this.page.evaluate(() => {
            return document.querySelectorAll(".artdeco-typeahead__input.job-posting-shared-company-typeahead__input");
        });
        console.log({ checkFormOne });
        if (!checkFormOne) {
            console.log('Navigated to LinkedIn check Which Form');
            return "First_Form";
        }
        return "Second_Form";
    }


    async postJobFirstForm(job_title: string, contract_type: number, skills: string[], description: string, questions: Array<any>): Promise<string> {
        try {

            if (!this.page) throw new Error('Browser has not been launched.');
            await this.page.click('.artdeco-typeahead__input'); // Focus on the input field

            await this.page.keyboard.down('Control')
            await delay(2000);
            await this.page.keyboard.press('A');
            await delay(2000);
            await this.page.keyboard.up('Control');
            await delay(2000);
            await this.page.keyboard.press('Backspace');
            await delay(2000);
            await this.page.type('.artdeco-typeahead__input[placeholder="Add the title you are hiring for"]', job_title, { delay: 100 });
            await delay(2000);
            await this.page.keyboard.press('ArrowDown');
            await delay(2000);
            await this.page.keyboard.press('Enter');
            await delay(2000); // job title selected
            /////

            await this.page.click('.artdeco-typeahead__input.job-posting-shared-company-typeahead__input'); // Company name
            await this.page.keyboard.down('Control');
            await delay(2000);
            await this.page.keyboard.press('A');
            await delay(2000);
            await this.page.keyboard.up('Control');
            await delay(2000);
            await this.page.keyboard.press('Backspace');
            await delay(2000);
            await this.page.type('.artdeco-typeahead__input.job-posting-shared-company-typeahead__input', 'Geek Labs Holdings', { delay: 100 });
            console.log(`the felid of com name has been input`)
            /////

            await this.page.click('.artdeco-dropdown.artdeco-dropdown--placement-bottom.artdeco-dropdown--justification-left.ember-view', { delay: 100 }); // Workplace type
            await delay(2000);
            await this.page.keyboard.press('ArrowDown', { delay: 1000 });
            await delay(2000);
            await this.page.keyboard.press('Enter');
            await delay(2000);
            console.log(`Workplace type selected`)
            /////
            const jobLocation = await this.page.click('.artdeco-typeahead__input[placeholder=""]')
            await this.page.click('.artdeco-typeahead__input[placeholder=""]'); // Job location
            await this.page.click('.artdeco-typeahead__input[placeholder=""]', { delay: 1000 }); // Job location
            await delay(2000);
            await this.page.keyboard.down('Control');
            await this.page.keyboard.press('A');
            await this.page.keyboard.up('Control');
            await this.page.keyboard.press('Backspace',);
            await delay(1000);
            await this.page.type('.artdeco-typeahead__input[placeholder=""]', "Maadi");
            await delay(1000);
            await this.page.keyboard.press('ArrowDown');
            await this.page.keyboard.press('Enter');
            console.log(`location selected`)

            await this.page.click('.job-posting-shared-job-type-dropdown__trigger', { delay: 1000 }) // Job type [Full-Time , Part-Time , .... , ....]
            for (let i = 0; i < contract_type; i++) {
                await this.page.keyboard.press('ArrowDown');
                await delay(1000);
            }
            await this.page.keyboard.press('Enter', { delay: 1000 });
            /////
            await this.page.evaluate(() => {
                Array.from(
                    document.querySelectorAll("button .artdeco-button__text")).forEach((submitButton) => {
                        if (submitButton.textContent === "\n    Write on my own\n") {
                            return (submitButton as HTMLElement).click();
                        }
                    })
            });

            await this.page.waitForNavigation({ timeout: 600000 })
            const url = await this.commonPostJobProcess(skills, description, questions);
            return url;

        }
        catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    async postJobSecondForm(job_title: string, contract_type: number, skills: string[], description: string, questions: Array<any>): Promise<string> {
        if (!this.page) throw new Error('Browser has not been launched.');
        console.log("Enter HERE");
        await this.page.click('.artdeco-typeahead__input.job-posting-shared-job-title-typeahead__input-v2'); // Focus on the input field
        console.log("HERE");
        await this.page.keyboard.down('Control')
        await this.page.keyboard.press('A');
        await this.page.keyboard.up('Control');
        await this.page.keyboard.press('Backspace');
        console.log("HERE", { job_title });
        await this.page.keyboard.type(job_title, { delay: 100 });
        await delay(2000);
        await this.page.keyboard.press('ArrowDown');
        await delay(2000);
        await this.page.keyboard.press('Enter');
        await delay(2000);
        console.log("Job title successfully selected");
        await this.page.evaluate(() => {
            Array.from(
                document.querySelectorAll("button .artdeco-button__text")).forEach((submitButton) => {
                    if (submitButton.textContent === "\n    Write on my own\n") {
                        return (submitButton as HTMLElement).click();
                    }
                })
        });

        await this.page.waitForNavigation({ timeout: 600000 })


        const jobDetails = await this.page.$$('.artdeco-typeahead__input');
        await delay(1000);
        jobDetails[1].focus();
        await this.page.keyboard.down('Control');
        await delay(1000);
        await this.page.keyboard.press('A');
        await delay(1000);
        await this.page.keyboard.up('Control');
        await delay(1000);
        await this.page.keyboard.press('Backspace');
        await delay(1000);
        await this.page.keyboard.type('Geek Labs Holdings ', { delay: 500 });
        console.log(`the felid of com name has been input`)
        /////

        await delay(2000);
        await this.page.keyboard.press('ArrowDown', { delay: 1000 });
        await this.page.keyboard.press('Enter');
        console.log(`Workplace type selected`)
        /////
        jobDetails[2].focus();
        await this.page.keyboard.down('Control');
        await delay(1000);
        await this.page.keyboard.press('A');
        await delay(1000);
        await this.page.keyboard.up('Control');
        await delay(1000);
        await this.page.keyboard.press('Backspace',);
        await delay(2000);
        await this.page.keyboard.type("Maadi", { delay: 500 });
        await delay(1000);
        await this.page.keyboard.press('ArrowDown');
        await delay(1000);
        await this.page.keyboard.press('Enter');
        await delay(1000);
        console.log(`location selected`)

        await this.page.click('.job-posting-shared-job-type-dropdown__trigger', { delay: 1000 }) // Job type [Full-Time , Part-Time , .... , ....]
        for (let i = 0; i <= contract_type; i++) {
            await this.page.keyboard.press('ArrowDown');
            await delay(1000);
        }
        await this.page.keyboard.press('Enter', { delay: 1000 });
        /////
        const url = await this.commonPostJobProcess(skills, description, questions);
        return url;
    }


    async commonPostJobProcess(skills: string[], description: string, questions: Array<any>): Promise<string> {
        if (!this.page) throw new Error('Browser has not been launched.');
        // Description
        await this.page.click(".ql-editor")
        await this.page.keyboard.down('Control');
        await delay(500);
        await this.page.keyboard.press('A', { delay: 500 });
        await delay(500);
        await this.page.keyboard.up('Control');
        await delay(500);
        await this.page.keyboard.press('Backspace', { delay: 500 });
        await delay(2000);
        console.log("description cleared");

        // Evaluate the element selection within the browser context
        const writeDescriptionSelector = await this.page.evaluate(() => {
            console.log("JERE 1"); // This log will show in the browser's console, not Node.js
            return document.querySelector(".ql-editor") ? ".ql-editor" : null;
        });

        if (writeDescriptionSelector) {
            // Interact with the element outside of evaluate
            const writeDescription = await this.page.$(writeDescriptionSelector);

            if (writeDescription) {
                // Set the innerHTML of the element
                await this.page.evaluate((el, desc) => {
                    el.innerHTML = desc;
                }, writeDescription, description);

                // Wait for a delay
                await delay(1200);
                console.log("description typed");
            } else {
                console.error("Could not find the write description element.");
            }
        } else {
            console.error("The selector '.ql-editor' was not found.");
        }

        // Close skills section
        await delay(5000)
        const closeSkills = await this.page.evaluate(() => {
            console.log(
                "JERE 2"
            );
            const closeButtons = document.querySelectorAll(".artdeco-pill.artdeco-pill--slate.artdeco-pill--2.artdeco-pill--dismiss.artdeco-pill--selected.ember-view.mv1.mr2.pv2");
            closeButtons.forEach(button => (button as HTMLElement).click());
            return closeButtons.length
        });
        console.log(`Closed ${closeSkills} skill(s)`);

        // Add Skill section 

        for (let i = 0; i < skills.length; i++) {
            await this.page.type(".artdeco-pill__input.job-posting-shared-job-skill-typeahead__ta-trigger", skills[i], { delay: 100 });
            await delay(2000);
            await this.page.keyboard.press("ArrowDown", { delay: 100 });
            await delay(1500);
            await this.page.keyboard.press("Enter", { delay: 100 });
        }

        await this.page.click(".artdeco-button.artdeco-button--2.artdeco-button--primary.ember-view", { delay: 100 });
        await delay(2500);


        await this.page.evaluate(async () => {
            console.log("JERE 3");
            Array.from(
                document.querySelectorAll(".artdeco-button.artdeco-button--circle.artdeco-button--muted.artdeco-button--1.artdeco-button--tertiary.ember-view.artdeco-card__dismiss"))
                .forEach(button => (button as HTMLElement).click())
        });


        // Add question section
        await delay(3000);
        await this.goToQuestionSection(questions);
        console.log("task has been finished");
        await delay(3000);
        await this.page.click(`.artdeco-button.artdeco-button--2.artdeco-button--primary.ember-view[data-validate-submit-type="Next"]`);
        ////Final 
        await delay(4000);
        await this.page.click(".job-posting-footer__secondary-cta.artdeco-button.artdeco-button--muted.artdeco-button--2.artdeco-button--secondary.ember-view")
        console.log("task has been finished");
        const url = this.page.url();
        console.log('Navigated to LinkedIn profile page', url);
        return url;
    }

    async goToQuestionSection(questions: Array<any>): Promise<void> {
        if (!this.page) throw new Error('Browser has not been launched.');
        console.log("Enter in Question Section");
        await delay(3000);
        const closeButton = await this.page.$$(".artdeco-button.artdeco-button--circle.artdeco-button--muted.artdeco-button--1.artdeco-button--tertiary.ember-view.artdeco-card__dismiss");

        for (const button of closeButton) {
            await delay(1000);
            button.click()
        }
        await delay(3000);

        await this.page.evaluate((questions) => {
            console.log("JERE 4");
            Array.from(
                document.querySelectorAll(".artdeco-button.artdeco-button--muted")).forEach(async (submitButton) => {
                    if (submitButton.textContent === "        \n    \n    \n\n\n\n\n    Custom Question\n") {
                        for (let i = 0; i < questions.length; i++) {
                            console.log("before click");
                            (submitButton as HTMLElement).click();
                            console.log("after click");
                        }
                    }
                })
        }, questions);
        console.log("Ended Clicking");
        await delay(2000);

        await this.page.type('.job-posting-shared-custom-question-description__input.artdeco-text-input--input.artdeco-text-input__textarea', questions[0].question, { delay: 100 });
        await this.page.keyboard.press('Tab', { delay: 500 });
        if (questions[0].type === 1) {
            await this.page.keyboard.press('Enter', { delay: 500 });
            await this.page.keyboard.press('ArrowDown', { delay: 500 });
            await this.page.keyboard.press('Enter', { delay: 500 });
            await this.page.keyboard.press('Tab', { delay: 500 });
            await this.page.keyboard.type((questions[0].answer).toString(), { delay: 500 });
        } else {
            await this.page.keyboard.press('Tab', { delay: 500 });
            if (questions[0].answer === 0) {
                await this.page.keyboard.press('n', { delay: 500 });
            }
        }
        let existFlag = 0;
        await delay(5000);
        for (let i = 1; i < questions.length; i++) {
            const exist = await this.page.$$('.job-posting-shared-custom-question-recommendation');
            if (exist.length > existFlag) {
                existFlag = existFlag + 1;
                await this.page.keyboard.press('Tab', { delay: 500 });
            }
            await this.page.keyboard.press('Tab', { delay: 500 });
            await this.page.keyboard.press('Tab', { delay: 500 });
            await this.page.keyboard.press('Tab', { delay: 500 });
            await this.page.keyboard.press('Tab', { delay: 500 });
            await this.page.keyboard.type(questions[i].question, { delay: 100 });
            await this.page.keyboard.press('Tab', { delay: 500 });
            if (questions[i].type === 1) {
                await this.page.keyboard.press('Enter', { delay: 500 });
                await this.page.keyboard.press('ArrowDown', { delay: 500 });
                await this.page.keyboard.press('Enter', { delay: 500 });
                await this.page.keyboard.press('Tab', { delay: 500 });
                await this.page.keyboard.type((questions[i].answer).toString(), { delay: 500 });
            } else {
                await this.page.keyboard.press('Tab', { delay: 500 });
                if (questions[i].answer === 0) {
                    await this.page.keyboard.press('n', { delay: 500 });
                }
            }

        };
        console.log("==================> End of Questions");
        return;
    }



    async closeBrowser(): Promise<void> {
        console.log("Close Browser");
        if (this.browser) {
            await this.browser.close();
            console.log('Browser closed');
        }
    }
}