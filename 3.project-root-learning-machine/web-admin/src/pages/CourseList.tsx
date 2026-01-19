import { useState, useEffect } from 'react'
import { Table, Button, Space, message, Modal } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { courseApi, Course } from '../api/course'

export default function CourseList() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const loadCourses = async () => {
    setLoading(true)
    try {
      const response = await courseApi.getCourseList({ page: page - 1, size: pageSize })
      setCourses(response.data.content)
      setTotal(response.data.totalElements)
    } catch (error) {
      message.error('加载课程列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [page, pageSize])

  const handleDelete = (courseId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个课程吗？',
      onOk: async () => {
        try {
          await courseApi.deleteCourse(courseId)
          message.success('删除成功')
          loadCourses()
        } catch (error) {
          message.error('删除失败')
        }
      }
    })
  }

  const handlePublish = async (courseId: string) => {
    try {
      await courseApi.publishCourse(courseId)
      message.success('发布成功')
      loadCourses()
    } catch (error) {
      message.error('发布失败')
    }
  }

  const columns = [
    {
      title: '课程名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category'
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Course) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />}>编辑</Button>
          {record.status === 'DRAFT' && (
            <Button type="link" onClick={() => handlePublish(record.id)}>发布</Button>
          )}
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />}>
          新建课程
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={courses}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: total,
          onChange: (page, pageSize) => {
            setPage(page)
            setPageSize(pageSize)
          }
        }}
      />
    </div>
  )
}
