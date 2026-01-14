import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core'

// Создаем HTTP-ссылку
const httpLink = createHttpLink({
  uri: 'http://localhost:8080/graphql', // Убедитесь, что порт совпадает с бэкендом
})

// Создаем и экспортируем клиент
export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  // В новой версии Apollo Client настройка devtools выглядит так:
  devtools: {
    enabled: true
  }
})
