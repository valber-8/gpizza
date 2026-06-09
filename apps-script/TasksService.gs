const TasksService = {
  getOrCreateTodayList() {
    const title = Config.tasksListPrefix + Utils.getTodayLabel();
    const lists = Tasks.Tasklists.list().items || [];
    const existing = lists.find(l => l.title === title);
    if (existing) return existing.id;
    return Tasks.Tasklists.insert({ title }).id;
  },

  createOrderTask(order_id, orderData, total) {
    const listId = this.getOrCreateTodayList();
    const itemSummary = orderData.items.map(i => `${i.qty}x ${i.name}`).join(', ');

    const task = Tasks.Tasks.insert({
      title: `${order_id} | ${orderData.customer_name} | R$${total.toFixed(2)} | ${orderData.order_type}`,
      notes: [
        `Phone: ${orderData.phone}`,
        `Items: ${itemSummary}`,
        orderData.delivery_address ? `Address: ${orderData.delivery_address}` : '',
        orderData.notes ? `Notes: ${orderData.notes}` : ''
      ].filter(Boolean).join('\n')
    }, listId);

    return task.id;
  },

  completeOrderTask(taskId) {
    if (!taskId) return;
    const lists = Tasks.Tasklists.list().items || [];
    const todayList = lists.find(l => l.title === Config.tasksListPrefix + Utils.getTodayLabel());
    if (!todayList) return;
    try {
      Tasks.Tasks.patch({ status: 'completed' }, todayList.id, taskId);
    } catch (e) {
      Logger.log('Could not complete task: ' + e.message);
    }
  }
};
