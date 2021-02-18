const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const dotenv = require('dotenv').config();
const express = require('express');

const app = express();

app.get('/bot', (req, res) => {
    res.send('');
    bidnapperBot();
});

app.listen(3333, () => console.log('Server listening on port 3000!'));

async function bidnapperBot() {
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
        textArea.sendKeys(
            '133206543187, 0, ebay, 1\n224281699354, 0, ebay, 1\n'
        );

        console.log('Inserting bulk...');
        await driver.findElement(By.name('massadd')).click();
    } finally {
        console.log('Done.');
    }
}
