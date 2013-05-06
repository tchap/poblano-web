Poblano Web
===========
Poblano Web is a simple web application that allows development teams to start
their projects rapidly.

Installation
------------
1. `virtualenv --distribute <path>`
2. `cd <path>`
3. `source bin/activate`
4. `pip install -r requirements.txt`
5. `git clone` into `src`

Configuration and Execution
---------------------------
1. Check `src/etc/environ.example` to see how the config file may look like.
2. `export POBLANO_ENVIRON=<path-to-your-environ>`
2. `src/bin/poblanoctl start`
3. `src/bin/poblanoctl` to see what else you can do with it.
