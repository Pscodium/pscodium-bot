/* eslint-disable @typescript-eslint/no-var-requires */
const { Builder, By, Key, until, Browser } = require("selenium-webdriver");
const fs = require("fs");

async function run() {
    let driver = await new Builder().forBrowser(Browser.CHROME).build();
    try {
        await driver.get("https://coolors.co/");

        await driver.wait(
            until.elementLocated(By.css('.iubenda-cs-container')),
            5000
        );

        await driver.findElement(By.xpath(`//*[@id="iubenda-cs-banner"]/div/div/div/div[3]/div[2]/button[2]`)).click();

        await driver.findElement(By.xpath(`//*[@id="whats-new"]/div/div[2]/div/a`)).click();

        await driver.findElement(By.xpath(`//*[@id="homepage_hero_text_btns"]/a[1]`)).click();

        await driver.wait(
            until.elementLocated(By.css('.modal_element')),
            5000
        );

        await driver.findElement(By.xpath(`//*[@id="generator-tutorial-intro"]/div/div[2]/div/a`)).click();

        await driver.wait(
            until.elementLocated(By.css('.modal_element')),
            5000
        );

        let colors = [];
        for (let i = 0; i < 20; i++) {
            await driver.findElement(By.xpath(`//*[@id="generator_export-btn"]`)).click();

            await driver.findElement(By.xpath(`//*[@id="palette-exporter_links"]/a[8]`)).click();

            const code = await driver.findElement(By.xpath(`//*[@id="text-viewer_text"]`));
            const text = await code.getText();
            const start = text.indexOf('{');
            const end = text.indexOf('}');
            const objSrt = text.substring(start, end + 1);
            const obj = JSON.parse(objSrt);
            colors.push(obj);

            await driver.findElement(By.xpath(`//*[@id="text-viewer"]/div/div[2]/div/a`)).click();

            await driver.findElement(By.xpath(`//*[@id="palette-exporter"]/div/div[2]/div/a`)).click();

            const body = driver.findElement(By.xpath(`/html/body`));
            body.sendKeys(Key.SPACE);
        }


        const modifiedColors = colors.map((color) => {
            const modifiedEntries = Object.entries(color).map(([name, code]) => {
                return [name, `#${code}`];
            });
            return Object.fromEntries(modifiedEntries);
        });

        var stream = fs.createWriteStream("colors/colors.json");
        stream.once('open', function(fd) {
            stream.write(JSON.stringify(modifiedColors));
            stream.end();
        });

    } finally {
        setTimeout(async () => {
            await driver.quit();
        }, 3000);
    }
}

run();
