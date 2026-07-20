import { useState, useEffect } from "react";
import { CheckSquare, Plus, Filter, Clock, AlertCircle, Brain, ChevronDown, ChevronUp, Trash2, Calendar, Zap, Sparkles, AlertTriangle, Info, Circle, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { motion, AnimatePresence } from "motion/react";
import { useOutletContext } from "react-router";
import { toast } from "sonner";
import { api, Task } from "../api";
import { useMonitoring } from "../contexts/MonitoringContext";

interface OutletContext {
  appEnabled: boolean;
  triggerCrisis: () => void;
}

export function Tasks() {


  const { appEnabled } = useOutletContext<OutletContext>();
  const { mentalLoad } = useMonitoring();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    complexity: "medium" as const,
    urgency: "medium" as const,
    estimatedMinutes: 30,
  });

  const [timeOfDay] = useState(new Date().getHours());

  // Load tasks from the backend
  useEffect(() => {
    api.listTasks().then(setTasks);
  }, []);

  // Check if mental load is too high
  const isMentalLoadTooHigh = mentalLoad > 75;

  const handleAddTaskClick = () => {
    if (isMentalLoadTooHigh) {
      toast.error("Mental Load Too High", {
        description: "You're past your mental load capacity. Taking a break is recommended to avoid burnout.",
        duration: 5000,
      });
      return;
    }
    setShowAddTask(true);
  };

  const addTask = async () => {
    if (!newTask.title.trim()) return;

    const task = await api.createTask(newTask);
    setTasks([...tasks, task]);
    setNewTask({
      title: "",
      description: "",
      complexity: "medium",
      urgency: "medium",
      estimatedMinutes: 30,
    });
    setShowAddTask(false);
    toast.success("Task added successfully!");
  };

  const toggleTask = async (id: string) => {
    const target = tasks.find(t => t.id === id);
    if (!target) return;
    const updated = await api.updateTask(id, { completed: !target.completed });
    setTasks(tasks.map(t => t.id === id ? updated : t));
  };

  const deleteTask = async (id: string) => {
    await api.deleteTask(id);
    setTasks(tasks.filter(t => t.id !== id));
    toast.success("Task deleted successfully!");
  };

  // Intelligent task sorting
  const getSortedTasks = () => {
    const incompleteTasks = tasks.filter(t => !t.completed);
    
    return incompleteTasks.sort((a, b) => {
      const scoreA = calculateTaskScore(a);
      const scoreB = calculateTaskScore(b);
      return scoreB - scoreA;
    });
  };

  const calculateTaskScore = (task: Task) => {
    let score = 0;

    // Base score from urgency
    const urgencyScores = { high: 50, medium: 30, low: 10 };
    score += urgencyScores[task.urgency];

    // Complexity matching with current mental capacity
    const currentCapacity = 100 - mentalLoad; // Higher mental load = less capacity
    
    if (task.complexity === "low" && currentCapacity < 40) {
      score += 30; // Prioritize simple tasks when tired
    } else if (task.complexity === "medium" && currentCapacity >= 40 && currentCapacity < 70) {
      score += 25;
    } else if (task.complexity === "high" && currentCapacity >= 70) {
      score += 35; // Do complex tasks when you have capacity
    } else if (task.complexity === "high" && currentCapacity < 40) {
      score -= 20; // Deprioritize complex tasks when tired
    }

    // Time of day considerations
    if (timeOfDay >= 8 && timeOfDay <= 11) {
      // Morning - good for complex tasks
      if (task.complexity === "high") score += 15;
    } else if (timeOfDay >= 14 && timeOfDay <= 16) {
      // Afternoon slump - prefer lighter tasks
      if (task.complexity === "low") score += 15;
    } else if (timeOfDay >= 19) {
      // Evening - avoid complex tasks
      if (task.complexity === "high") score -= 10;
      if (task.complexity === "low") score += 10;
    }

    return score;
  };

  const getRecommendation = (task: Task) => {
    const currentCapacity = 100 - mentalLoad;
    const score = calculateTaskScore(task);

    if (score > 60) {
      return {
        text: "Perfect timing for this task",
        color: "emerald",
        icon: Zap,
      };
    } else if (task.complexity === "high" && currentCapacity < 40) {
      return {
        text: "Wait for lower mental load",
        color: "amber",
        icon: Clock,
      };
    } else if (task.complexity === "low" && currentCapacity > 70 && task.urgency === "low") {
      return {
        text: "Good filler task",
        color: "cyan",
        icon: Zap,
      };
    } else {
      return {
        text: "Good task for now",
        color: "purple",
        icon: CheckSquare,
      };
    }
  };

  const getTimeRecommendation = (task: Task) => {
    if (task.complexity === "high" && timeOfDay >= 8 && timeOfDay <= 11) {
      return "Now (peak hours)";
    } else if (task.complexity === "high" && timeOfDay >= 19) {
      return "Tomorrow morning";
    } else if (task.complexity === "low" && mentalLoad > 70) {
      return "Anytime today";
    } else if (task.complexity === "medium") {
      if (timeOfDay < 14) return "This morning";
      else if (timeOfDay < 17) return "This afternoon";
      else return "This evening or tomorrow";
    }
    return "When ready";
  };

  const sortedTasks = getSortedTasks();
  const completedTasks = tasks.filter(t => t.completed);

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "high": return "text-red-400 border-red-400/30 bg-red-400/10";
      case "medium": return "text-amber-400 border-amber-400/30 bg-amber-400/10";
      case "low": return "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";
      default: return "text-gray-400";
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    
    if (minutes >= 180) {
      return "over 3 hours";
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    } else {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${remainingMinutes}min`;
    }
  };

  return (
    <div 
      className="min-h-full px-6 py-6 pt-8"
      style={{
        background: 'linear-gradient(to bottom, rgba(20, 10, 30, 1) 0%, rgba(0, 0, 0, 1) 100%)'
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl mb-2 text-white tracking-wide flex items-center gap-2" style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 500, letterSpacing: '0.02em' }}>
            Task Intelligence
            <span className="text-purple-200" style={{ textShadow: '0 0 12px rgba(216, 180, 254, 0.6), 0 0 6px rgba(216, 180, 254, 0.4)' }}>✦</span>
          </h2>
          <p className="text-gray-400 text-sm" style={{ fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '0.01em' }}>
            Smart task sorting based on your current state
          </p>
        </div>

        {/* Current State Summary */}
        <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 p-5 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <Brain className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-base text-white mb-2">Your Current Capacity</h3>
              <div className="text-sm">
                <div className="text-gray-400 text-xs mb-1">Mental Load</div>
                <div className={`font-medium ${mentalLoad > 70 ? 'text-red-400' : mentalLoad > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {mentalLoad.toFixed(0)}%
                </div>
              </div>
              <div className="mt-3 text-sm text-indigo-300">
                {mentalLoad < 40 ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Great time for complex tasks
                  </span>
                ) : mentalLoad > 70 ? (
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Focus on simple tasks to avoid overload
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </Card>

        {/* Divider */}
        <div className="border-t border-gray-800 mb-8"></div>

        {/* Add Task Button - Always visible */}
        {!showAddTask && (
          <Button
            onClick={handleAddTaskClick}
            className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-white mb-8 w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Task
          </Button>
        )}

        {/* Mental Load Warning Banner */}
        {isMentalLoadTooHigh && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/40 p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-red-500/30 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base text-white mb-1 font-medium">Mental Load Capacity Exceeded</h3>
                  <p className="text-sm text-gray-300 mb-3">
                    You're past your mental load threshold. Adding new tasks right now could lead to burnout and decreased productivity.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-orange-300">
                    <Info className="w-4 h-4" />
                    <span>Recommendation: Take a 10-15 minute break to reset your focus</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Add Task Form */}
        {showAddTask && (
          <Card className="bg-[#0f0f0f] border-purple-500/30 p-5 mb-6">
            <h3 className="text-base text-white mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Task
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Task Title</label>
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="What needs to be done?"
                  className="bg-gray-900/50 border-gray-700 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Description (optional)</label>
                <Textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Any additional details..."
                  className="bg-gray-900/50 border-gray-700 text-white min-h-[60px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Complexity</label>
                  <Select
                    value={newTask.complexity}
                    onValueChange={(value: any) => setNewTask({ ...newTask, complexity: value })}
                  >
                    <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Simple task</SelectItem>
                      <SelectItem value="medium">Medium - Moderate effort</SelectItem>
                      <SelectItem value="high">High - Complex work</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Urgency</label>
                  <Select
                    value={newTask.urgency}
                    onValueChange={(value: any) => setNewTask({ ...newTask, urgency: value })}
                  >
                    <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Estimated Time: {formatTime(newTask.estimatedMinutes)}
                </label>
                <input
                  type="range"
                  min="5"
                  max="180"
                  step="5"
                  value={newTask.estimatedMinutes}
                  onChange={(e) => setNewTask({ ...newTask, estimatedMinutes: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={addTask}
                  className="flex-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-white"
                >
                  Add Task
                </Button>
                <Button
                  onClick={() => setShowAddTask(false)}
                  variant="ghost"
                  className="text-gray-400 hover:text-gray-300"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Active Tasks - Compact View */}
        {sortedTasks.length > 0 && (
          <div className="mb-10">
            <h3 className="text-base text-white mb-3 flex items-center gap-2">
              <Circle className="w-4 h-4 text-cyan-400" />
              Active Tasks ({sortedTasks.length})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sortedTasks.map((task) => (
                <Card
                  key={task.id}
                  className="bg-[#0f0f0f] border-gray-800 hover:border-cyan-500/30 transition-colors p-3"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="text-gray-500 hover:text-emerald-400 transition-colors flex-shrink-0"
                    >
                      <Circle className="w-5 h-5" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white text-sm font-medium truncate">{task.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${getComplexityColor(task.complexity)}`}>
                          {task.complexity}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatTime(task.estimatedMinutes)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Order */}
        {sortedTasks.length > 0 && (
          <div className="mb-10">
            <h3 className="text-base text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Recommended Order
            </h3>
            
            <div className="space-y-3">
              {sortedTasks.map((task, index) => {
                const rec = getRecommendation(task);
                const timeRec = getTimeRecommendation(task);
                const IconComponent = rec.icon;

                return (
                  <Card
                    key={task.id}
                    className="bg-[#0f0f0f] border-gray-800 hover:border-purple-500/30 transition-colors p-4"
                  >
                    <div className="flex items-start gap-3">
                      {/* Priority Number */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/30 to-cyan-500/30 flex items-center justify-center flex-shrink-0 text-white font-medium text-sm">
                        {index + 1}
                      </div>

                      {/* Task Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-white font-medium text-sm">{task.title}</h4>
                          <button
                            onClick={() => toggleTask(task.id)}
                            className="text-gray-500 hover:text-emerald-400 transition-colors flex-shrink-0"
                          >
                            <Circle className="w-5 h-5" />
                          </button>
                        </div>

                        {task.description && (
                          <p className="text-gray-400 text-xs mb-2">{task.description}</p>
                        )}

                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className={`text-xs px-2 py-0.5 rounded border ${getComplexityColor(task.complexity)}`}>
                            {task.complexity} complexity
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded border border-gray-700 text-gray-400">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {formatTime(task.estimatedMinutes)}
                          </span>
                        </div>

                        {/* Recommendation */}
                        <div className={`flex items-center gap-2 text-xs ${
                          rec.color === 'emerald' ? 'text-emerald-400' :
                          rec.color === 'amber' ? 'text-amber-400' :
                          rec.color === 'cyan' ? 'text-cyan-400' : 'text-purple-400'
                        }`}>
                          <IconComponent className="w-3.5 h-3.5" />
                          <span>{rec.text}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-400">{timeRec}</span>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div>
            <h3 className="text-base text-white mb-3 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              Completed ({completedTasks.length})
            </h3>
            
            <div className="space-y-2">
              {completedTasks.map((task) => (
                <Card
                  key={task.id}
                  className="bg-[#0f0f0f] border-emerald-500/20 p-3 opacity-60"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="text-emerald-400 flex-shrink-0"
                    >
                      <CheckSquare className="w-5 h-5" />
                    </button>
                    <div className="flex-1 line-through text-gray-500 text-sm">
                      {task.title}
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {tasks.length === 0 && (
          <Card className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 border-gray-700 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-base text-white mb-2">No tasks yet</h3>
            <p className="text-sm text-gray-400 mb-4">
              Add your first task and let SYNTEX help you prioritize based on your current state
            </p>
            <Button
              onClick={handleAddTaskClick}
              className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Task
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}