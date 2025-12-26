
const API_URL = 'http://172.17.80.1:8080/graphql'

export async function gplClient(query, variables = {}) {
  const headers = {
    'Content-Type': 'application/json',
  }

  // 1. Ищем токен
  const token = localStorage.getItem('smartshop_token')

  // 2. Если есть — добавляем заголовок
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        query: query,
        variables: variables,
      }),
    })

    if (!response.ok) {
      // Если 401 Unauthorized — можно разлогинивать юзера
      if (response.status === 401) {
        localStorage.removeItem('smartshop_token')
        // window.location.reload() // Опционально: перезагрузить страницу
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const json = await response.json()

    if (json.errors) {
      console.error('GraphQL Errors:', json.errors)
      throw new Error(json.errors.map((e) => e.message).join('\n'))
    }

    return json.data
  } catch (error) {
    console.error('GraphQL Client Error:', error)
    throw error
  }
}
