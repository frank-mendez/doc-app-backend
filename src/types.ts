interface MetaData {
  [key: string]: any
}

interface JsonAPI {
  version?: string
  ext?: string[]
  profile?: string[]
  meta?: MetaData
}

interface Link {
  href?: string
  title?: string
  describedby?: string
  meta?: MetaData
}

interface Links {
  self: string
  related: Link
}

export interface IResponse {
  data: {
    [key: string]: any
  }
  errors?: any
  meta?: MetaData
  jsonapi?: JsonAPI
  links?: Links
}
