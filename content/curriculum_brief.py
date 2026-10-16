#!/usr/bin/env python3
"""Print the curriculum-architect brief for one song:  python3 content/curriculum_brief.py <songId>"""
import os
import subprocess
import sys

here = os.path.dirname(os.path.abspath(__file__))
sys.exit(subprocess.call([sys.executable, os.path.join(here, "build_lessons.py"), "--brief", sys.argv[1]]))
