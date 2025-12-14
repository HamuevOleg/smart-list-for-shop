
const API_URL = 'http://172.17.80.1:8080/graphql'

export async function gplClient(query, variables = {}) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        variables: variables,
      }),
    })

    if (!response.ok) {
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
