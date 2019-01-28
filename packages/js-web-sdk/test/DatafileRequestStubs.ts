import * as sinon from 'sinon'

export interface DatafileRequestStubs {
  setup: () => void
  restore: () => void
  requests: sinon.SinonFakeXMLHttpRequest[]
}

export function setupDatafileRequestStubs(): DatafileRequestStubs {
  let xhr: sinon.SinonFakeXMLHttpRequestStatic | undefined
  let localStorageStub: sinon.SinonStub<[string], string | null> | undefined
  const requests: sinon.SinonFakeXMLHttpRequest[] = []
  return {
    requests,
    setup() {
      xhr = sinon.useFakeXMLHttpRequest()
      xhr.onCreate = (req) => requests.push(req)
      localStorageStub = sinon.stub(window.localStorage, 'getItem').returns(null)
    },
    restore() {
      if (xhr) {
        xhr.restore()
      }
      if (localStorageStub) {
        localStorageStub.restore()
      }
    }
  }
}
