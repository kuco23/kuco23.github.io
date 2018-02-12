from git import Repo
from os import listdir

repo_dir = ''
repo = Repo(repo_dir)

file_list = listdir()

commit_message = 'test Python Push'
repo.index.add(file_list)
repo.index.commit(commit_message)
origin = repo.remote('origin master')
origin.push()
