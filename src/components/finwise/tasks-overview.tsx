import React from 'react';
import { TaskCard } from './task-card';
import type { Task } from '@/lib/domain';

interface TasksOverviewProps {
  tasks: Task[];
}

export function TasksOverview({ tasks }: TasksOverviewProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-card text-card-foreground">
        <h3 className="font-bold">素晴らしい！</h3>
        <p className="text-muted-foreground">全てのタスクが完了しています。</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
