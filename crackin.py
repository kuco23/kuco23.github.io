from fbchat import Client
from fbchat.models import *
from time import sleep

options = ['mmtaf', 'afdaf', 'fafa', 'memento23']
i = 0
me = None
while True:
    try:
        me = Client('nseverkar@gmail.com', options[i])
    except FBchatUserError:
        pass
    if me != None:
        break
    i += 1
    sleep(5)
