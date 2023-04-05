import fs from 'fs/promises'
import Jimp from 'jimp'
import { openStreamDeck } from '@elgato-stream-deck/node'
import { exit } from 'process'


// Automatically discovers connected Stream Decks, and attaches to the first one.
// Throws if there are no connected stream decks.
// You also have the option of providing the devicePath yourself as the first argument to the constructor.
// For example: const myStreamDeck = new StreamDeck('\\\\?\\hid#vid_05f3&pid_0405&mi_00#7&56cf813&0&0000#{4d1e55b2-f16f-11cf-88cb-001111000030}')
// On linux the equivalent would be: const myStreamDeck = new StreamDeck('0001:0021:00')
// Available devices can be found with listStreamDecks()
const SD = await openStreamDeck() // Will throw an error if no Stream Decks are connected.

SD.on('down', (keyIndex) => {
	console.log('key %d down', keyIndex)
  SD.fillKeyColor(keyIndex, 255, 0, 0)
})

SD.on('up', (keyIndex) => {
	console.log('key %d up', keyIndex)
  SD.fillKeyColor(keyIndex, 0, 0, 0)
})

// Fired whenever an error is detected by the `node-hid` library.
// Always add a listener for this event! If you don't, errors will be silently dropped.
SD.on('error', (error) => {
	console.error(error)
})

// read images from frame_0.jpg to frame_87.jpg at ./assets/rickroll/
const images = await Promise.all(
  Array.from(
    { length: 88 },
    (_, i) => Jimp.read(`./assets/rickroll/frame_${i}.jpg`).then(img => img.resize(SD.ICON_SIZE, SD.ICON_SIZE))
  )
)

async function play() {
  for (let i = 0; i < 88; i++) {
    SD.fillKeyBuffer(7, images[i % 88].bitmap.data, { format: 'rgba' }).catch(console.error)
    // sleep 65ms
    await new Promise(resolve => setTimeout(resolve, 65))
  }
}

let loops = 1
while (loops--) {
  await play()
}
// clear 14 keys
for (let i = 0; i < 14; i++) {
  await SD.clearKey(i)
}
console.log('Exiting.')
SD.close()
// exit(0)
// Fill the first button form the left in the first row with a solid red color. This is asynchronous.
// await myStreamDeck.fillKeyColor(4, 255, 0, 0)
// console.log('Successfully wrote a red square to key 4.')