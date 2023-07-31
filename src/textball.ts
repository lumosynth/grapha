/**
 * This takes in some text and then converts it into the text prefixed with the length
 * It then adds it to the first shard with a size less than 1GB
 * So it would check ./shards/0.shard first, then ./shards/1.shard, etc.
 * If a shard doesn't exist yet, it has a size of 0
 * 
 * @param text The text to add to a shard
 * @param shardDir The shard directory
 */
export async function addTextToFirstOpenShard(text:string,shardDir="./shards") {
	if (text.trim() == '') {
		return;
	}

	let shardId = 0;

	const encodedText = new TextEncoder().encode(text);
	const encodedTextWithSize = new Uint8Array([
		...intToBytes(encodedText.length),
		...encodedText,
	]);

	while (true) {
		const shardPath = `${shardDir}/${shardId}.shard`;
		
		try {
			const stat = await Deno.stat(shardPath);
			const sizeWithText = stat.size + encodedTextWithSize.length * 6;
	
			const KB = 1000;
			const MB = 1000 * KB;
	
			if (sizeWithText > MB * 45) {
				shardId++;
				continue;
			}
		} catch {
			// The shard doesn't exist yet, it will fit our text
		}

		// Append
		await Deno.writeFile(shardPath, encodedTextWithSize, {
			append:true,
			create:true
		});
	}
}

function intToBytes(int:number) {
	const byteArray = new Uint8Array(4);
	for (let index = 0; index < byteArray.length; index++) {
	  const byte = int & 0xff;
	  byteArray[index] = byte;
	  int = (int - byte) / 256;
	}
	return byteArray;
}
