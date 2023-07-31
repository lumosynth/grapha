import { addTextToFirstOpenShard } from "./textball.ts";
import { DOMParser, Node } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

/**
 * This extracts all the text from html and adds it to shards
 * 
 * @param html The html to extract
 */
export async function addHTMLToDataset(html:string) {
	const parser = new DOMParser();

	const doc = parser.parseFromString(html, "text/html");

	if (!doc) {
		return;
	}

	// get all nodes, not just html elements
	function getAllChildren(node:Node) {
		let children = [node];

		for (const child of node.childNodes) {
			children = [...children, ...getAllChildren(child)];
		}

		return children;
	}

	const nodes = getAllChildren(doc.body);

	const usedText:string[] = [];

	for (const node of nodes) {
		if (node.childNodes.length == 0) {
			if (!usedText.includes(node.textContent)) {
				usedText.push(node.textContent);
				addTextToFirstOpenShard(node.textContent);
			}
		}
	}
}
