import { InputMaybe, Pagination } from '../.graphclient/index.js'

export const page = <T extends unknown[]>(
  data: T,
  pagination: InputMaybe<Pagination | undefined>,
): T => {
  if (
    !pagination ||
    pagination.pageIndex === undefined ||
    pagination.pageSize === undefined
  )
    return data
  const start = pagination.pageIndex * pagination.pageSize
  const end = (pagination.pageIndex + 1) * pagination.pageSize
  return data.slice(start, end) as T
}
