import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import LinkedInScraperService from "./LinkedinScrapeService";
import * as fs from "fs";
import path from "path";

const delay = async (time) => {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
};
export default class GetCandidate extends LinkedInScraperService {
  downloadDir;
  async uploadToS3(bucket, key, data) {
    const s3Client = new S3Client({
      region: "us-east-1",
      credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
      },
    });
    const params = {
      Bucket: bucket,
      Key: key,
      Body: data,
      ACL: "public-read-write",
    };
    try {
      const command = new PutObjectCommand(params);
      const data = await s3Client.send(command);
    } catch (err) {
      console.log("Error", err);
    }
  }
  async setUpDownloadDir() {
    console.log(__dirname);
    this.downloadDir = path.resolve(__dirname, "../downloaded-CV");
    if (!fs.existsSync(this.downloadDir)) {
      fs.mkdirSync(this.downloadDir);
    }
    await this.page._client().send("Page.setDownloadBehavior", {
      behavior: "allow",
      downloadPath: this.downloadDir,
    });
    console.log("Finish");
  }

  async getApplicants() {
    if (!this.page) throw new Error("Browser has not been launched.");
    console.log("Start get Applicants");
    await this.setUpDownloadDir();
    console.log("end set up download");
    await this.page.goto("https://www.linkedin.com/my-items/posted-jobs/", {
      waitUntil: "domcontentloaded",
    });
    await delay(1000);
    console.log("Navigated to the posted jobs page");
    await this.page.evaluate(() => {
      console.log("Clicking the first job");
      const button = Array.from(
        document.querySelectorAll(
          ".workflow-results-container ul li a.app-aware-link"
        )
      );
      if (button.length > 0) {
        console.log(
          "Button found, clicking it ====> ",
          button[0].innerText,
          button[1].innerText
        );
        button[1].click();
      } else {
        console.log("No job found");
      }
    });
    await delay(5000);

    await this.page.evaluate(() => {
      console.log("Clicking the View applicants button");
      const button = Array.from(
        document.querySelectorAll(".hiring-job-top-card button.artdeco-button")
      );

      if (button) {
        console.log("Button found, clicking it");
        button[0].click();
      }
    });

    await delay(5000);
    const applicantURLs = await this.page.evaluate(() => {
      const applicant = [];
      let currentPage = 1;
      while (true) {
        const anchors = document.querySelectorAll(".artdeco-list li a");
        Array.from(anchors).forEach((anchor) => {
          console.log("================", anchor.href);
          let href = anchor.href;
          if (href.startsWith("/")) {
            href = `https://www.linkedin.com${href}`;
          }
          applicant.push(href);
        });
        currentPage += 1;
        const button = Array.from(document.querySelectorAll("button")).find(
          (el) => el.getAttribute("aria-label") === `Page ${currentPage}`
        );
        if (button) {
          console.log("Clicking the next page button ====>", currentPage);
          button.click();
        } else {
          console.log * "No more pages to click";
          break;
        }
      }
      return applicant;
    });

    console.log("Applicant URLs:", applicantURLs);

    const applicantDetails = await this.extractApplicantDetails(applicantURLs);
    return applicantDetails;
  }

  async extractApplicantDetails(applicantURLs) {
    if (!this.page) throw new Error("Browser has not been launched.");
    const details = [];
    for (const url of applicantURLs) {
      try {
        await this.page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: 120000,
        });

        // Click the "More" button to reveal additional data
        await this.page.click(
          ".hiring-applicant-header-actions > div:last-of-type button"
        );
        await delay(2000); // Wait for the data to load

        // Extract name
        const name = await this.page.evaluate(() => {
          const nameElement = document.querySelector(
            "h1.display-flex.align-items-center.t-24"
          );
          return nameElement
            ? nameElement.innerText.split("’s application")[0].trim()
            : "";
        });

        // Extract profile link, email, and phone from three li > ul
        const { profileLink, email, phone } = await this.page.evaluate(() => {
          const dropdownItems = document.querySelectorAll(
            ".artdeco-dropdown__content-inner ul li"
          );
          const result = {
            profileLink: "",
            email: "",
            phone: "",
          };

          if (dropdownItems.length >= 3) {
            const profileElement = dropdownItems[0].querySelector("a");
            result.profileLink = profileElement ? profileElement.href : "";

            const emailElement = dropdownItems[1].querySelector(
              ".hiring-applicant-header-actions__more-content-dropdown-item-text"
            );

            result.email =
              emailElement && emailElement.textContent
                ? emailElement.textContent.trim()
                : "";

            const phoneElement = dropdownItems[2].querySelector(
              ".hiring-applicant-header-actions__more-content-dropdown-item-text"
            );
            result.phone =
              phoneElement && phoneElement.textContent
                ? phoneElement.textContent.trim()
                : "";
          }

          return result;
        });

        // Download CV to the local folder
        let cvPath = null;
        let fileName = null;
        try {
          const cvDownloadElement = await this.page.$(
            ".display-flex.justify-space-between.align-items-flex-start.pl5.pr5.pt5.pb3 a"
          );
          if (cvDownloadElement) {
            await cvDownloadElement.click();
            await delay(5000); // Wait for the download to complete

            fileName = `${email}-${new Date().valueOf()}.pdf`;
            cvPath = path.join(this.downloadDir, fileName);

            // set CV Name to the applicant's name
            const files = fs.readdirSync(this.downloadDir);
            const latestFile = files
              .map((file) => ({
                name: file,
                time: fs
                  .statSync(path.join(this.downloadDir, file))
                  .mtime.getTime(),
              }))
              .sort((a, b) => b.time - a.time)
              .map((file) => file.name)[0];

            fs.renameSync(path.join(this.downloadDir, latestFile), cvPath);
            const data = fs.readFileSync(cvPath);
            await this.uploadToS3("machine-genius", `cv/${fileName}`, data);
            await fs.unlinkSync(cvPath);
          }
        } catch (error) {
          console.log(`No CV found in this url for ${name}: ${error}`);
        }

        if (name) {
          details.push({
            url,
            name,
            profileLink,
            email,
            phone,
            cvPath: "https://machine-genius.s3.amazonaws.com/cv/" + fileName,
          });
        }

        await delay(4000);
      } catch (error) {
        console.error(`Failed to extract details from ${url}:`, error);
      }
    }
    return details;
  }
}