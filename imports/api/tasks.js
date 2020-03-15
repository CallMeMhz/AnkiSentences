import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Tasks = new Mongo.Collection('tasks');

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('tasks', function tasksPublication() {
    return Tasks.find({
      $or: [
        { private: { $ne: true } },
        { owner: this.userId },
      ],
    });
  });
}

export const CalcExp = function(score, delta) {
  score = score || 0
  delta = delta || 0
  var k
  if (delta < 86400000) {
    k = 1
  } else {
    delta /= 86400000
    k = 1 / delta
  }

  var exp = score * k
  return Math.round(exp * 100) / 100
}

Meteor.methods({
  'tasks.insert'(text, translation) {
    check(text, String);
    check(translation, String);

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    var now = new Date()

    Tasks.insert({
      text,
      translation,
      createdAt: now,
      updatedAt: now,
      owner: Meteor.userId(),
      username: Meteor.user().username,
      score: 5,
    });
  },
  'tasks.remove'(taskId) {
    check(taskId, String);

    const task = Tasks.findOne(taskId);
    if (task.private && task.owner !== Meteor.userId()) {
      // If the task is private, make sure only the owner can delete it
      throw new Meteor.Error('not-authorized');
    }

    Tasks.remove(taskId);
  },
  'tasks.setPrivate'(taskId, setToPrivate) {
    check(taskId, String);
    check(setToPrivate, Boolean);

    const task = Tasks.findOne(taskId);

    // Make sure only the task owner can make a task private
    if (task.owner !== Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    Tasks.update(taskId, { $set: { private: setToPrivate } });
  },
  'tasks.remember'(taskId) {
    const task = Tasks.findOne(taskId)

    var now = new Date()
    var delta = now - (task.updatedAt || now - 86400000 * 30)
    var exp = CalcExp(task.score, delta)

    if (delta < 86400000) {
      delta = 86400000
    }

    var newScore = exp + 2 * 86400000 / delta
    console.log(newScore)
    if (newScore > 10) {
      newScore = 10
    }

    Tasks.update(taskId, { $set: { score: newScore, updatedAt: now } })
  },
  'tasks.forget'(taskId) {
    const task = Tasks.findOne(taskId)

    var now = new Date()
    var delta = now - (task.updatedAt || now - 86400000 * 30)
    var exp = CalcExp(task.score, delta)

    if (delta < 86400000) {
      delta = 86400000
    }

    var newScore = exp + 1 * 86400000 / delta
    console.log(newScore)
    if (newScore > 10) {
      newScore = 10
    }

    Tasks.update(taskId, { $set: { score: newScore, updatedAt: now } })
  }
});