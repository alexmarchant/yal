import{ interpretFile } from '../../helpers'

describe('get', () => {
  it('gets some html', async () => {
    const res = await interpretFile(__dirname + '/../../samples/http-get.yal')
    expect(res).toContain('Google')
  })
})