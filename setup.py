# encoding: utf-8

from setuptools import setup

setup(name='mapplotter',
      version='1.0.0',
      description='Generate map URL given livelihood event ids.',
      url='https://github.com/StudyNightClub/livelihood_map',
      author='Chungdial Lin',
      author_email='',
      license='MIT',
      py_modules=['mapplotter'],
      install_requires=[
          'requests==2.17.3',
      ],
     )
