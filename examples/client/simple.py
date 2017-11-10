import requests
import json

payload = {
  'vars': {
    'num1': 55,
    'num2': 1,
  },
  'body': [
    {
      'func': 'addTwo',
      'args': {
        'num1': 2,
        'num2': 4
      },
      'store': '$run1'
    },
    {
      'func': 'addTwo',
      'args': {
        'num1': -442,
        'num2': 5.32
      },
      'store': '$run2'
    },
    {
      'func': 'addTwo',
      'args': {
        'num1': '$num1',
        'num2': -3
      }
    },
    {
      'func': 'addTwo',
      'args': {
        'num1': '$run1',
        'num2': '$run2'
      }
    },
    {
      'func': 'echo',
      'exec': ['$run1']
    },
    {
      'func': 'and',
      'exec': [
        True,
        '$num2',
        {
          'func': 'addTwo',
          'args': {
            'num1': 33,
            'num2': -33
          }
        }
      ]
    },
    {
      'func': 'or',
      'exec': [
        True,
        '$num2',
        {
          'func': 'addTwo',
          'args': {
            'num1': 33,
            'num2': -32
          }
        }
      ]
    },
    {
      'func': 'map',
      'ref': 'and',
      'exec': [
        [True, False],
        [True, '$num1']
      ]
    }
  ]
}

response = requests.post('http://localhost:3000/general', headers={ 'Content-Type': 'application/json' }, data=json.dumps(payload))

if response.ok:
  print(json.loads(response.text))
else:
  print(response.text)