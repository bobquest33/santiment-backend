import Future from 'fluture'
import postSentiment from './postSentiment'

const userId = 'user',
      asset = 'BTC',
      sentiment = 'bullish',
      submittedTs = (new Date())

test("postSentiment post valid entry", (done)=>{
  const db = {
    logSentimentSubmittedEvent:(e)=>{
      expect(e).toMatchObject({
        userId: userId,
        asset: asset,
        sentiment: sentiment,
        submittedTimestamp: submittedTs
      })
      return Future.of({})
    }
  }
  let body = {
    userId:userId,
    asset:asset,
    sentiment:sentiment,
    date:submittedTs.toISOString()}

  postSentiment(db)({
    body: JSON.stringify(body)
  })
    .chain(_=>postSentiment(db)({body:body}))
    .fork( (error)=>{throw error}, done)
})

const testPostInvalidEntry = (event)=>{
  test("postSentiment post invalid entry", (done)=>{
    const db = {
      logSentimentSubmittedEvent:(e)=>{throw e}
    }

    postSentiment(db)(event)
      .fork( done, (val)=>{throw val})
  })
}

testPostInvalidEntry(null)
testPostInvalidEntry(123)
testPostInvalidEntry({})
testPostInvalidEntry({body:{}})

// We should allow arbitrary assets. Validation is client-side
test("postSentiment post valid entry for arbitrary asset", (done)=>{
  const db = {
    logSentimentSubmittedEvent:(e)=>{
      expect(e).toMatchObject({
        userId: userId,
        asset: "I'm your new asset",
        sentiment: sentiment,
        submittedTimestamp: submittedTs
      })
      return Future.of({})
    }
  }
  let body = {
    userId:userId,
    asset:"I'm your new asset",
    sentiment:sentiment,
    date:submittedTs.toISOString()}

  postSentiment(db)({
    body: JSON.stringify(body)
  })
    .chain(_=>postSentiment(db)({body:body}))
    .fork( (error)=>{throw error}, done)
})