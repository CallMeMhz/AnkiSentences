import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Session } from 'meteor/session'

import { Tasks, CalcExp } from '../api/tasks.js';

import './task.js';
import './body.html';

Template.body.onCreated(function bodyOnCreated() {
  this.state = new ReactiveDict()
  Meteor.subscribe('tasks')
})

Template.body.helpers({
  tasks() {
    // const instance = Template.instance();
    // if (instance.state.get('hideCompleted')) {
    //   // If hide completed is checked, filter tasks
    //   return Tasks.find({ checked: { $ne: true } }, { sort: { createdAt: -1 } });
    // }
    // Otherwise, return all of the tasks
    var now = new Date()
    var res = []
    Tasks.find({}, {sort: {createdAt: -1}}).fetch().forEach(task => {
      res.push({
        _id: task._id,
        text: task.text,
        translation: task.translation,
        score: task.score,
        delta: task.delta,
        exp: CalcExp(task.score, now - (task.updatedAt || now - 86400000 * 30)),
        username: task.username,
      })
    });
    if (!Session.get('sort-mode')) {
      return res
    }
    res.sort(function(x, y) {
      return CalcExp(x.score, now - x.updatedAt) - CalcExp(y.score, now - y.updatedAt)
    })
    return res
  },
  count() {
    return Tasks.find({}).count();
  },
});

Template.body.events({
  'submit .new-task'(event) {
    // Prevent default browser form submit
    event.preventDefault();

    // Get value from form element
    const target = event.target;
    const text = target.text.value;
    const translation = target.translation.value;

    Meteor.call('tasks.insert', text, translation)

    // Clear form
    target.text.value = '';
    target.translation.value = '';
    target.text.focus()
  },
  // 'change .hide-completed input'(event, instance) {
  //   instance.state.set('hideCompleted', event.target.checked);
  // },
  'change .delete-mode input'(event) {
    Session.set({ 'delete-mode': event.target.checked });
  },
  'change .sort-mode input'(event) {
    Session.set({ 'sort-mode': event.target.checked });
  },
  'change .shift-mode input'(event) {
    Session.set({ 'shift-mode': event.target.checked });
  },
});