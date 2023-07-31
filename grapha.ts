import Inquirer from "https://esm.sh/enquirer@2.4.1";
import { parseFeed } from "https://deno.land/x/rss@1.0.0/mod.ts";
import { addHTMLToDataset } from "./src/htmltext.ts";

const inq = new Inquirer();

const source = (await inq.prompt([
	{
		type: "select",
		name: "source",
		message: "What source do you want to scrape?",
		choices: [
			"RSS",
			"Modchat",
		],
	}
]) as { source: "RSS" | "Modchat" }).source;

if (
	await inq.prompt([
		{
			type: "confirm",
			name: "confirm",
			message: `Are you sure you want to scrape from ${source}?`,
		}
	])
) {
	if (
		await inq.prompt([
			{
				type: "confirm",
				name: "confirm",
				message: `THIS IS YOUR LAST CHANCE TO NOT SCRAPE FROM ${source.toUpperCase()}`,
			}
		])
	) {
		if (source === 'RSS') {
			await scrapeRSS();
		}
	}
}

async function scrapeRSS() {
	const feedListURL =
		'https://raw.githubusercontent.com/AKSW/LiveRdfNews/master/rdflivenews-crawler/src/main/resources/Copy%20of%20rss-list.txt'; // https://raw.githubusercontent.com/frezbo/rss-feeds/main/feeds.txt

	console.log('Scraping RSS');

	console.log('Downloading feed list...');

	const feedRequest = await fetch(feedListURL);
	const feedList = await feedRequest.text();
	const feeds = feedList.split('\n');

	console.log(`Discovered ${feeds.length} feeds`);

	console.log(`Scraping feeds`);

	let index = 1;

	for (const feed of feeds) {
		try {
			await TimeoutFunction(scrapeFeed(feed,index++,feeds.length));
		} catch {
			// ouch
		}
	}
}

async function scrapeFeed(feed:string,index:number,count:number) {
	console.log(feed,`${index}/${count}`);
	try {
		const feedRequest = await fetch(feed);

		if (feedRequest.status === 200) {
			const feedData = await feedRequest.text();

			const parsedFeed = await parseFeed(feedData);
	
			for (const post of parsedFeed.entries) {
				if (post.content) {
					if (post.content.value) {
						await addHTMLToDataset(post.content.value);
					}
				}
			}
		}
	} catch {
		console.error(`Failed to scrape feed ${feed}`);
	}
}

function TimeoutFunction(promise:Promise<void>) {
	return new Promise<void>((resolve,reject) => {
		setTimeout(() => {
			reject("ouch");
		}, 2000);
		promise.then(resolve).catch(reject);
	})
}
