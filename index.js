const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const dotenv = require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
const PORT = 3022;

app.post('/bot', (req, res) => {
    const data = req.body;
    let bulkStr = '';
    let status, message;

    data.map(item => {
        const {id, max_amount } = item;
        const moneyRegx = /^\d+(?:\.\d{0,2})$/;
        if (moneyRegx.test(max_amount)) {
            bulkStr += `${id}, ${max_amount}, ebay, 1\n`;
        }
    });

    bidnapperBot(bulkStr);
    res.status(200).send({message: 'Success'})
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}!`));

async function bidnapperBot(input) {
    const screen = {
        width: 640,
        height: 480,
    };

    let driver = new Builder()
        .forBrowser('chrome')
        .setChromeOptions(new chrome.Options().headless().windowSize(screen))
        .build();

    const username = process.env.BIDNAPPER_USERNAME;
    const password = process.env.BIDNAPPER_PASSWORD;

    try {
        // Navigate to url
        await driver.get(process.env.BIDNAPPER_URL);

        // Enter username and password
        await driver.findElement(By.name('username')).sendKeys(username);
        await driver.findElement(By.name('password')).sendKeys(password);
        await driver.findElement(By.xpath('//button[@type="submit"]')).click();
        console.log('Logging in...');

        await driver.manage().setTimeouts({ implicit: 2000 });
        console.log('Login successful');

        await driver.get(process.env.BIDNAPPER_BULK_ADD_URL);
        console.log('Navigating to bulk add page...');
        await driver.manage().setTimeouts({ implicit: 1000 });

        const textArea = await driver.findElement(By.name('data'));
        textArea.sendKeys(input);

        console.log('Inserting bulk...');
        await driver.findElement(By.name('massadd')).click();
    } finally {
        console.log('Done.');
    }
}
