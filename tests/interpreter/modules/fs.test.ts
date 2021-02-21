import{ interpretFile } from '../../helpers'

describe('readFile', () => {
  it('returns the content as a string', async () => {
    const res = await interpretFile(__dirname + '/../../samples/fs-readfile.yal')
    expect(res).toBe('1234')
  })
})