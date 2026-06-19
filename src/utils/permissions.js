const config = require('../config/config');

function isStaff(member) {
  return (
    member.roles.cache.has(config.adminRoleId) ||
    member.roles.cache.has(config.modRoleId) ||
    member.roles.cache.has(config.supportRoleId) ||
    member.permissions.has('Administrator')
  );
}

function isAdmin(member) {
  return (
    member.roles.cache.has(config.adminRoleId) ||
    member.permissions.has('Administrator')
  );
}

module.exports = { isStaff, isAdmin };
