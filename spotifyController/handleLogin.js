// import { Builder, Browser, By, Key, until } from 'selenium-webdriver';
// // const ChromeDriverManager = require('selenium-webdriver/chrome');
// // const FirefoxDriverManager = require('selenium-webdriver/firefox');
// // const EdgeDriverManager = require('selenium-webdriver/edge');
// // const SafariDriverManager = require('selenium-webdriver/safari');
// // const os = require('os');

// const webdriver = require("selenium-webdriver");
// // const By = webdriver.By;
// // const until = webdriver.until;

// // async function getDriver() {
// //   const platform = os.platform();

// //   let defaultBrowser = null;

// //   if (platform === 'win32') {
// //     // Windows: Use registry to find the default browser
// //     try {
// //       const registry = require('winreg');
// //       const key = registry.openKey(registry.HKEY_CURRENT_USER, 'Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\FileExts\\.htm\\OpenWithList');
// //       defaultBrowser = registry.queryValueEx(key, 'MRUList')[0].split(',')[0].trim().toUpperCase();
// //     } catch (error) {
// //       console.error('Error getting default browser from registry:', error);
// //     }
// //   } else if (platform === 'darwin') {
// //     // macOS: Use 'defaults' command
// //     try {
// //       const { execSync } = require('child_process');
// //       const output = execSync('defaults read com.apple.LaunchServices LSHandlers').toString();
// //       if (output.includes('com.google.Chrome')) {
// //         defaultBrowser = 'Chrome';
// //       } else if (output.includes('org.mozilla.firefox')) {
// //         defaultBrowser = 'Firefox';
// //       } else if (output.includes('com.apple.Safari')) {
// //         defaultBrowser = 'Safari';
// //       }
// //     } catch (error) {
// //       console.error('Error getting default browser from defaults command:', error);
// //     }
// //   }

// //   if (defaultBrowser) {
// //     console.log(`Detected default browser: ${defaultBrowser}`);
// //     let driver;
// //     switch (defaultBrowser) {
// //       case 'CHROME':
// //         driver = await new Builder()
// //           .forBrowser('chrome')
// //           .setChromeService(ChromeDriverManager().install())
// //           .build();
// //         break;
// //       case 'FIREFOX':
// //         driver = await new Builder()
// //           .forBrowser('firefox')
// //           .setFirefoxService(FirefoxDriverManager().install())
// //           .build();
// //         break;
// //       case 'EDGE':
// //         driver = await new Builder()
// //           .forBrowser('edge')
// //           .setEdgeService(EdgeDriverManager().install())
// //           .build();
// //         break;
// //       case 'SAFARI':
// //         driver = await new Builder()
// //           .forBrowser('safari')
// //           .setSafariService(SafariDriverManager().install())
// //           .build();
// //         break;
// //       default:
// //         console.error('Unsupported browser. Please use Chrome, Firefox, Edge, or Safari.');
// //         return null;
// //     }
// //     return driver;
// //   } else {
// //     console.error('Unable to detect default browser. Please specify one manually.');
// //     return null;
// //   }
// // }

// async function handleLogin() {
//   // const driver = await getDriver();

//   const driver = await new Builder().forBrowser(Browser.SAFARI).build()

//   if (driver) {
//     try {
//       // await driver.get('https://accounts.spotify.com/en/login');

//     //   // Wait for the URL to change to the "status" page
//     //   await driver.wait(until.urlIs('https://accounts.spotify.com/en/status'), 40000);

//     //   console.log('Logged in!');

//     //   const cookies = await driver.manage().getCookies();
//     //   console.log(cookies);

//     //   await driver.quit();
//     } catch (error) {
//       console.error('Error during automation:', error);
//     }
//   }
//   return "Logged in!"
// }

// export { handleLogin };


// import { remote } from 'webdriverio'

async function handleLogin() {
  // const browser = await remote({
  //     capabilities: { browserName: 'chrome' }
  // })

  // await browser.navigateTo('https://www.google.com/ncr')

  // const searchInput = await browser.$('#lst-ib')
  // await searchInput.setValue('WebdriverIO')

  // const searchBtn = await browser.$('input[value="Google Search"]')
  // await searchBtn.click()

  // console.log(await browser.getTitle()) // outputs "WebdriverIO - Google Search"

  // await browser.deleteSession()
}

// const {Builder, By, Key, until} = require('selenium-webdriver');
// async function handleLogin() {
//   let driver = await new Builder().forBrowser('safari').build();
//   try {
//     await driver.get('https://www.google.com');
//   } finally {
//     await driver.quit();
//   }
// };

export { handleLogin };
