import { Layout } from 'antd'
import './App.css'

const { Header, Content } = Layout

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ color: 'white', fontSize: '20px' }}>
        学习应用管理后台
      </Header>
      <Content style={{ padding: '24px' }}>
        {/* Routes will be added here */}
        <div>欢迎使用学习应用管理后台</div>
      </Content>
    </Layout>
  )
}

export default App
