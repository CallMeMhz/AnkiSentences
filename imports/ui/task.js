import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session'
 
import './task.html';

Template.task.helpers({
  deleteMode() {
    return Session.get('delete-mode');
  },
  shiftMode() {
    return Session.get('shift-mode')
  },
  isOwner() {
    return this.owner === Meteor.userId();
  },
  // exp() {
  //   var now = new Date()
  //   return CalcExp(this.score, now - this.updatedAt)
  // },
  bgc(exp) {
    var g = 255 * exp/10
    var r = 255 - g
    return `background-image: linear-gradient(to right, rgba(${r}, ${g}, 100, 0.3), #fff 100%)`
  },
});
 
Template.task.events({
  'click .delete'() {
    Meteor.call('tasks.remove', this._id);
  },
  'click .toggle-private'() {
    Meteor.call('tasks.setPrivate', this._id, !this.private);
  },
  'click #remember'() {
    Meteor.call('tasks.remember', this._id)
  },
  'click #forget'() {
    Meteor.call('tasks.forget', this._id)
  },
});