import { useState, useEffect } from 'preact/hooks'
import { CarWriter } from '@ipld/car/writer'
import { importer } from 'ipfs-unixfs-importer'
import { default as browserReadableStreamToIt } from 'browser-readablestream-to-it'
import { makeStorageDeal } from './makeStorageDeal'   


export function App(props) {
  const [files, setFiles] = useState([])
  const [rootCid, setRootCid] = useState()
    const handleMakeStorageDeal = () => {
      console.log('Button clicked!');
    };
  return (
    <div>
      <section class="tc">
        <p class="ma0 pv3 ph2 mw7 center f4 fw6 lh-copy dark-blue">
           Get Started!!! <br/>Upload your files here.....
        </p><br/>
        <p class="ma0 pv3 ph2 mw7 center f4 fw6 lh-copy dark-gray">
          Use your browser to hash files with <a href="https://ipfs.io" class="link black fw7">IPFS</a> and export them as a verifiable
          <a class="blue link underline-hover ml1" href="https://ipld.io/specs/transport/car/">
            <span class="nowrap">content-addressed</span> archive
          </a>
        </p>
        <div class="mw6 center mt4">
          <FileForm files={files} setFiles={setFiles} />
          { files.length ? (
            <ul class="tl bg-near-white ma0 ph0 pv2" style="list-item-style:none">
            {files.map(f =>
              <li class="db pv1 ph3 fw4 f6 truncate nowrap black">
                <span>{f.name}</span>
              </li>
            )}
          </ul>
          ) : null }
        </div>
        {files && files.length ? (
          <div>
            <div class="mw6 center tl bg-light-gray black pt2 pb3 ph3 fw4 f7 overflow-y-scroll">
              <label class="db">
                IPFS <abbr title="Content ID aka the IPFS HASH">CID</abbr>
              </label>
              <code >{rootCid ? rootCid.toString() : '...'}</code>
            </div>
            <CarDownloadLink files={files} rootCid={rootCid} setRootCid={setRootCid} className="db mt4 pa3 mw5 center white link bg-blue f5 fw6 br1">
              Download .car file
            </CarDownloadLink>
          </div>
        ) : null}
        <p class="tc pt2 ph3 mw6 center f6 fw4 lh-copy dark-gray">
          <strong class="gold">:warning:</strong> You must import your car file to an IPFS node to be able to retrieve the contents from a gateway or other peers.
        </p>
        <label >
        <button onClick={handleMakeStorageDeal}>Make Storage Deal</button>
        <button onClick={makeStorageDeal}>Shell script </button>
        </label>
      </section>
    </div>
  )
}

const Arrow = () => <span class="silver fw5">→</span>
function CarDownloadLink ({files, className, children, setRootCid, rootCid}) {
  const [carUrl, setCarUrl] = useState()
  useEffect(async () => {
    if (!files || files.length === 0) return
    const {root, car} = await createCarBlob(files)
    if (car) {
      setCarUrl(URL.createObjectURL(car))
      setRootCid(root)
    }
  }, [files])
  return carUrl ? <a class={className} href={carUrl} download={`${rootCid}.car`}>{children}</a> : null
}

function FileForm ({files = [], setFiles}) {
  return (
    <form style={{opacity: files.length ? 0.8 : 1}}>
      <label class="db mh2 mh0-ns pv3 link pointer glow o-90 bg-blue white relative br1">
        <span class="fw6 f5">
          {files.length ? "Pick some other files :page_facing_up:" : "Open file picker :page_facing_up:" }
        </span>
        <input class="dn" type="file" multiple onChange={onFileInput.bind(null, setFiles)}/>
      </label>
    </form>
  )
}

function onFileInput (setFiles, evt) {
  evt.preventDefault()
  evt.stopPropagation()
  const fileList = evt && evt.target && evt.target.files
  const files = []
  for (const file of fileList) {
    files.push(file)
  }
  console.log('adding', files)
  setFiles(files)
}

async function createCarBlob (files) {
  if (!files || !files.length) return
  if (files.car) return
  const carParts = []
  const { root, out } = await fileListToCarIterator(files)
  for await (const chunk of out) {
    carParts.push(chunk)
  }
  const car = new Blob(carParts, {
    type: 'application/car',
  })
  return { root, car }
}
class MapBlockStore {
  constructor () {
    this.store = new Map()
  }
  * blocks () {
    for (const [cid, bytes] of this.store.entries()) {
      yield {cid, bytes}
    }
  }
  put ({ cid, bytes }) {
    return Promise.resolve(this.store.set(cid, bytes))
  }
  get (cid) {
    return Promise.resolve(this.store.get(cid))
  }
}
export async function fileListToCarIterator (fileList, blockApi = new MapBlockStore())  {
  const fileEntries = []
  for (const file of fileList) {
    fileEntries.push({
      path: file.name,
      content: browserReadableStreamToIt(file.stream())
    })
  }
  const options = {
    cidVersion: 1,
    wrapWithDirectory: true,
    rawLeaves: true
  }
  const unixFsEntries = []
  for await (const entry of importer(fileEntries, blockApi, options)) {
    unixFsEntries.push(entry)
  }
  const root = unixFsEntries[unixFsEntries.length - 1].cid
  const { writer, out } = CarWriter.create(root)
  for (const block of blockApi.blocks()) {
    writer.put(block)
  }
  writer.close()
  console.log(root.toString())
  return { root, out }

}

export default App;
