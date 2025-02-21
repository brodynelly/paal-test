export type Usage = {
  owner: string
  status: string
  costs: number
  region: string
  stability: number
  lastEdited: string
  breed: string
}

export type OverviewData = {
  date: string
  Temperature: number
  "BCS Score": number
  Posture: number
}