"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerTrigger } from "@/components/ui/drawer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FiPlus, FiCalendar, FiClock, FiUser, FiHome, FiCheck, FiTrash2 } from "react-icons/fi"

export default function TasksPage() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Follow up with Amit Verma",
      description: "Call to discuss site visit feedback",
      dueDate: "Today, 2:00 PM",
      priority: "High",
      completed: false,
      category: "Follow-up",
    },
    {
      id: 2,
      title: "Prepare documents for Priya Malhotra",
      description: "Loan application documents",
      dueDate: "Today, 5:00 PM",
      priority: "Medium",
      completed: false,
      category: "Documentation",
    },
    {
      id: 3,
      title: "Site visit with Rajesh Kumar",
      description: "Urban Heights property",
      dueDate: "Tomorrow, 11:00 AM",
      priority: "High",
      completed: false,
      category: "Site Visit",
    },
    {
      id: 4,
      title: "Update CRM with new leads",
      description: "Add leads from property exhibition",
      dueDate: "May 5, 2024",
      priority: "Low",
      completed: true,
      category: "Admin",
    },
    {
      id: 5,
      title: "Send brochure to Sneha Patel",
      description: "Lakeview Residency details",
      dueDate: "May 3, 2024",
      priority: "Medium",
      completed: true,
      category: "Marketing",
    },
  ])

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Medium",
    category: "Follow-up",
  })

  const handleAddTask = () => {
    if (!newTask.title) {
      toast.error("Please enter a task title")
      return
    }

    const task = {
      id: tasks.length + 1,
      ...newTask,
      completed: false,
    }

    setTasks([task, ...tasks])
    setNewTask({
      title: "",
      description: "",
      dueDate: "",
      priority: "Medium",
      category: "Follow-up",
    })
    setIsAddTaskOpen(false)
    toast.success("Task added successfully")
  }

  const toggleTaskCompletion = (id: number) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          const updatedTask = { ...task, completed: !task.completed }
          if (updatedTask.completed) {
            toast.success(`Task "${task.title}" marked as complete`)
          }
          return updatedTask
        }
        return task
      }),
    )
  }

  const deleteTask = (id: number) => {
    const taskToDelete = tasks.find((task) => task.id === id)
    setTasks(tasks.filter((task) => task.id !== id))
    toast.success(`Task "${taskToDelete?.title}" deleted`)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400"
      case "Medium":
        return "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400"
      case "Low":
        return "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400"
      default:
        return "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Follow-up":
        return <FiUser className="h-4 w-4" />
      case "Site Visit":
        return <FiHome className="h-4 w-4" />
      case "Documentation":
        return <FiCalendar className="h-4 w-4" />
      case "Admin":
        return <FiClock className="h-4 w-4" />
      case "Marketing":
        return <FiHome className="h-4 w-4" />
      default:
        return <FiCalendar className="h-4 w-4" />
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <AppLayout title="Targets" backUrl="/dashboard">
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">My Targets</h2>
          <Drawer open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
            <DrawerTrigger asChild>
              <Button size="sm" className="h-9">
                <FiPlus className="mr-1" />
                Add Target
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader className="border-b pb-4">
                <DrawerTitle>Add New Target</DrawerTitle>
              </DrawerHeader>
              <div className="px-4 py-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    placeholder="Task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    placeholder="Task description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Due Date</label>
                  <Input
                    placeholder="e.g., Today, 2:00 PM"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select
                      value={newTask.category}
                      onValueChange={(value) => setNewTask({ ...newTask, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Follow-up">Follow-up</SelectItem>
                        <SelectItem value="Site Visit">Site Visit</SelectItem>
                        <SelectItem value="Documentation">Documentation</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DrawerFooter className="pt-2">
                <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTask}>Add Task</Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>

        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="bg-muted/50 pb-2">
            <CardTitle className="text-sm font-medium">Task Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{tasks.filter((task) => !task.completed).length}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {tasks.filter((task) => !task.completed && task.priority === "High").length}
                </p>
                <p className="text-xs text-muted-foreground">High Priority</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{tasks.filter((task) => task.completed).length}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="mt-4">
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
              {tasks
                .filter((task) => !task.completed)
                .map((task) => (
                  <motion.div key={task.id} variants={item} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Card className="overflow-hidden border-none shadow-sm hover:shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start">
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => toggleTaskCompletion(task.id)}
                            className="mt-1 mr-3"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium">{task.title}</p>
                                <p className="text-sm text-muted-foreground">{task.description}</p>
                              </div>
                              <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center text-xs text-muted-foreground">
                                <FiClock className="mr-1 h-3 w-3" />
                                {task.dueDate}
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="flex items-center space-x-1 h-6">
                                  {getCategoryIcon(task.category)}
                                  <span>{task.category}</span>
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-destructive"
                                  onClick={() => deleteTask(task.id)}
                                >
                                  <FiTrash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              {tasks.filter((task) => !task.completed).length === 0 && (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <FiCheck className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">No pending tasks</p>
                  <Button variant="outline" className="mt-4" onClick={() => setIsAddTaskOpen(true)}>
                    Add New Task
                  </Button>
                </div>
              )}
            </motion.div>
          </TabsContent>
          <TabsContent value="completed" className="mt-4">
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
              {tasks
                .filter((task) => task.completed)
                .map((task) => (
                  <motion.div key={task.id} variants={item} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Card className="overflow-hidden border-none shadow-sm hover:shadow bg-muted/20">
                      <CardContent className="p-4">
                        <div className="flex items-start">
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => toggleTaskCompletion(task.id)}
                            className="mt-1 mr-3"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium line-through text-muted-foreground">{task.title}</p>
                                <p className="text-sm text-muted-foreground line-through">{task.description}</p>
                              </div>
                              <Badge variant="outline" className="bg-muted text-muted-foreground">
                                {task.priority}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center text-xs text-muted-foreground">
                                <FiClock className="mr-1 h-3 w-3" />
                                {task.dueDate}
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge
                                  variant="outline"
                                  className="flex items-center space-x-1 h-6 bg-muted text-muted-foreground"
                                >
                                  {getCategoryIcon(task.category)}
                                  <span>{task.category}</span>
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-destructive"
                                  onClick={() => deleteTask(task.id)}
                                >
                                  <FiTrash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              {tasks.filter((task) => task.completed).length === 0 && (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <FiCheck className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">No completed tasks</p>
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
