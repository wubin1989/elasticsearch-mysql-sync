module.exports = {
  "schedule": {
    cronTime: '*/10 * * * * *',
    start: false
  },
  "mysql": {
    "host": '127.0.0.1',
    "user": 'root',
    "password": '123',
    "database": 'employees'
  },
  "initialParameter": {
    "lastexecutionstart": null,
    "lastexecutionend": null,
    "totalrows": 44
  },
  "sql": [{
      // "statement": "select *, emp_no as _id from employees order by emp_no limit 2",
      "statement": "select *, emp_no as _id from employees order by emp_no limit 2 offset ?",
      "parameter": ["$totalrows"]
    },
    // {
    //   "statement": "update employees set first_name=? where emp_no=?",
    //   "parameter": ["Jack", 10001]
    // }, 
    // {
    //   "statement": "select *, emp_no as _id from employees where emp_no=?",
    //   "parameter": [10001]
    // }
  ],
  "elasticsearch": {
    "host": [{
      "host": "localhost",
      "port": 9200,
      "auth": "elastic:changeme",
    }],
    "requestTimeout": 300000000,
    "log": "error"
  },
  "index": "employees",
  "type": "employee",
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 2
  },
  "mappings": {
    "employee": {
      "properties": {
        "emp_no": {
          "type": "long"
        },
        "birth_date": {
          "type": "date"
        },
        "first_name": {
          "type": "text",
          "index": false
        },
        "last_name": {
          "type": "text",
          "index": false
        },
        "gender": {
          "type": "text",
          "index": false
        },
        "hire_date": {
          "type": "date"
        }
      }
    }
  }
}