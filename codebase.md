# .devcontainer/devcontainer.json

```json
{
  "name": "Magic Store Dev Container",
  // Sets the run context to one level up instead of the .devcontainer folder.
  "context": "..",
  // Update the VARIANT arg in docker-compose.yml to pick a Node.js version
  // Options: 18, 16, 14
  "build": {
    // Points to the Dockerfile in the .devcontainer directory
    "dockerfile": "Dockerfile",
    "context": ".." // Build context is the workspace root
  },

  // Configure tool-specific properties.
  "customizations": {
    // Configure properties specific to VS Code.
    "vscode": {
      // Add the IDs of extensions you want installed when the container is created.
      "extensions": [
        "angular.ng-template", // Angular Language Service
        "dbaeumer.vscode-eslint", // ESLint
        "esbenp.prettier-vscode", // Prettier
        "ms-azuretools.vscode-docker", // Docker extension
        "firsttris.vscode-jest-runner" // Jest Runner (useful for backend tests)
        // Add other extensions like GitLens, theme, etc. if desired
      ],
      "settings": {
        // Add any specific VS Code settings for the container
        "terminal.integrated.shell.linux": "/bin/bash" // Or /bin/zsh if installed
      }
    }
  },

  // Use 'forwardPorts' to make a list of ports inside the container available locally.
  "forwardPorts": [4200, 3000], // Forward Angular dev server and NestJS API ports

  // Use 'postCreateCommand' to run commands after the container is created.
  "postCreateCommand": "npm install --verbose", // Install dependencies, generating lockfile for container OS

  // Comment out to connect as root instead. More info: https://aka.ms/vscode-remote/containers/non-root.
  "remoteUser": "node" // Run as the non-root 'node' user defined in the Dockerfile
}

```

# .devcontainer/Dockerfile

```
# Use an official Node.js LTS image based on Debian Bullseye Slim for good compatibility
# See https://github.com/microsoft/vscode-dev-containers/tree/v0.245.0/containers/typescript-node
ARG VARIANT="20-bullseye-slim"
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:0-${VARIANT}

# [Optional] Uncomment this section to install additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends <your-package-list-here>

# [Optional] Uncomment if you want to install an additional version of node using nvm
# ARG EXTRA_NODE_VERSION=16
# RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

# [Optional] Uncomment if you want to install more global node packages
# RUN su node -c "npm install -g <your-package-list-here>"

# Install Angular CLI globally (useful within the container)
# Run as root before switching to non-root user
USER root
RUN npm install -g @angular/cli

# Switch back to the non-root user 'node'
USER node

# Set working directory (optional, defaults usually work)
# WORKDIR /workspaces/magic-store-workspace

# Note: Dependencies will be installed via postCreateCommand in devcontainer.json
# This avoids rebuilding the image layer every time package-lock.json changes during development.

```

# .editorconfig

```
# Editor configuration, see https://editorconfig.org
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[*.ts]
quote_type = single
ij_typescript_use_double_quotes = false

[*.md]
max_line_length = off
trim_trailing_whitespace = false

```

# .eslintrc.json

```json
{
  "root": true,
  "ignorePatterns": [
    "projects/**/*" // Ignore project-specific configs if they exist later
  ],
  "overrides": [
    {
      "files": [
        "*.ts"
      ],
      "parserOptions": {
        "project": [
          "tsconfig.json" // Use the root tsconfig
        ],
        "createDefaultProgram": true
      },
      "extends": [
        "plugin:@angular-eslint/recommended",
        "plugin:@angular-eslint/template/process-inline-templates",
        "plugin:prettier/recommended" // Enables eslint-plugin-prettier and eslint-config-prettier. Displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
      ],
      "rules": {
        // Add any specific rule overrides here if needed
        "@angular-eslint/directive-selector": [
          "error",
          {
            "type": "attribute",
            "prefix": "app", // Adjust if needed
            "style": "camelCase"
          }
        ],
        "@angular-eslint/component-selector": [
          "error",
          {
            "type": "element",
            "prefix": "app", // Adjust if needed
            "style": "kebab-case"
          }
        ]
      }
    },
    {
      "files": [
        "*.html"
      ],
      "extends": [
        "plugin:@angular-eslint/template/recommended",
        "plugin:prettier/recommended" // Apply prettier to HTML templates
      ],
      "rules": {
        // Add any specific HTML rule overrides here if needed
      }
    }
  ]
}

```

# .git_disabled/config

```
[core]
	repositoryformatversion = 0
	filemode = false
	bare = false
	logallrefupdates = true
	ignorecase = true

```

# .git_disabled/description

```
Unnamed repository; edit this file 'description' to name the repository.

```

# .git_disabled/HEAD

```
ref: refs/heads/master

```

# .git_disabled/hooks/applypatch-msg.sample

```sample
#!/bin/sh
#
# An example hook script to check the commit log message taken by
# applypatch from an e-mail message.
#
# The hook should exit with non-zero status after issuing an
# appropriate message if it wants to stop the commit.  The hook is
# allowed to edit the commit message file.
#
# To enable this hook, rename this file to "applypatch-msg".

. git-sh-setup
commitmsg="$(git rev-parse --git-path hooks/commit-msg)"
test -x "$commitmsg" && exec "$commitmsg" ${1+"$@"}
:

```

# .git_disabled/hooks/commit-msg.sample

```sample
#!/bin/sh
#
# An example hook script to check the commit log message.
# Called by "git commit" with one argument, the name of the file
# that has the commit message.  The hook should exit with non-zero
# status after issuing an appropriate message if it wants to stop the
# commit.  The hook is allowed to edit the commit message file.
#
# To enable this hook, rename this file to "commit-msg".

# Uncomment the below to add a Signed-off-by line to the message.
# Doing this in a hook is a bad idea in general, but the prepare-commit-msg
# hook is more suited to it.
#
# SOB=$(git var GIT_AUTHOR_IDENT | sed -n 's/^\(.*>\).*$/Signed-off-by: \1/p')
# grep -qs "^$SOB" "$1" || echo "$SOB" >> "$1"

# This example catches duplicate Signed-off-by lines.

test "" = "$(grep '^Signed-off-by: ' "$1" |
	 sort | uniq -c | sed -e '/^[ 	]*1[ 	]/d')" || {
	echo >&2 Duplicate Signed-off-by lines.
	exit 1
}

```

# .git_disabled/hooks/fsmonitor-watchman.sample

```sample
#!/usr/bin/perl

use strict;
use warnings;
use IPC::Open2;

# An example hook script to integrate Watchman
# (https://facebook.github.io/watchman/) with git to speed up detecting
# new and modified files.
#
# The hook is passed a version (currently 2) and last update token
# formatted as a string and outputs to stdout a new update token and
# all files that have been modified since the update token. Paths must
# be relative to the root of the working tree and separated by a single NUL.
#
# To enable this hook, rename this file to "query-watchman" and set
# 'git config core.fsmonitor .git/hooks/query-watchman'
#
my ($version, $last_update_token) = @ARGV;

# Uncomment for debugging
# print STDERR "$0 $version $last_update_token\n";

# Check the hook interface version
if ($version ne 2) {
	die "Unsupported query-fsmonitor hook version '$version'.\n" .
	    "Falling back to scanning...\n";
}

my $git_work_tree = get_working_dir();

my $retry = 1;

my $json_pkg;
eval {
	require JSON::XS;
	$json_pkg = "JSON::XS";
	1;
} or do {
	require JSON::PP;
	$json_pkg = "JSON::PP";
};

launch_watchman();

sub launch_watchman {
	my $o = watchman_query();
	if (is_work_tree_watched($o)) {
		output_result($o->{clock}, @{$o->{files}});
	}
}

sub output_result {
	my ($clockid, @files) = @_;

	# Uncomment for debugging watchman output
	# open (my $fh, ">", ".git/watchman-output.out");
	# binmode $fh, ":utf8";
	# print $fh "$clockid\n@files\n";
	# close $fh;

	binmode STDOUT, ":utf8";
	print $clockid;
	print "\0";
	local $, = "\0";
	print @files;
}

sub watchman_clock {
	my $response = qx/watchman clock "$git_work_tree"/;
	die "Failed to get clock id on '$git_work_tree'.\n" .
		"Falling back to scanning...\n" if $? != 0;

	return $json_pkg->new->utf8->decode($response);
}

sub watchman_query {
	my $pid = open2(\*CHLD_OUT, \*CHLD_IN, 'watchman -j --no-pretty')
	or die "open2() failed: $!\n" .
	"Falling back to scanning...\n";

	# In the query expression below we're asking for names of files that
	# changed since $last_update_token but not from the .git folder.
	#
	# To accomplish this, we're using the "since" generator to use the
	# recency index to select candidate nodes and "fields" to limit the
	# output to file names only. Then we're using the "expression" term to
	# further constrain the results.
	my $last_update_line = "";
	if (substr($last_update_token, 0, 1) eq "c") {
		$last_update_token = "\"$last_update_token\"";
		$last_update_line = qq[\n"since": $last_update_token,];
	}
	my $query = <<"	END";
		["query", "$git_work_tree", {$last_update_line
			"fields": ["name"],
			"expression": ["not", ["dirname", ".git"]]
		}]
	END

	# Uncomment for debugging the watchman query
	# open (my $fh, ">", ".git/watchman-query.json");
	# print $fh $query;
	# close $fh;

	print CHLD_IN $query;
	close CHLD_IN;
	my $response = do {local $/; <CHLD_OUT>};

	# Uncomment for debugging the watch response
	# open ($fh, ">", ".git/watchman-response.json");
	# print $fh $response;
	# close $fh;

	die "Watchman: command returned no output.\n" .
	"Falling back to scanning...\n" if $response eq "";
	die "Watchman: command returned invalid output: $response\n" .
	"Falling back to scanning...\n" unless $response =~ /^\{/;

	return $json_pkg->new->utf8->decode($response);
}

sub is_work_tree_watched {
	my ($output) = @_;
	my $error = $output->{error};
	if ($retry > 0 and $error and $error =~ m/unable to resolve root .* directory (.*) is not watched/) {
		$retry--;
		my $response = qx/watchman watch "$git_work_tree"/;
		die "Failed to make watchman watch '$git_work_tree'.\n" .
		    "Falling back to scanning...\n" if $? != 0;
		$output = $json_pkg->new->utf8->decode($response);
		$error = $output->{error};
		die "Watchman: $error.\n" .
		"Falling back to scanning...\n" if $error;

		# Uncomment for debugging watchman output
		# open (my $fh, ">", ".git/watchman-output.out");
		# close $fh;

		# Watchman will always return all files on the first query so
		# return the fast "everything is dirty" flag to git and do the
		# Watchman query just to get it over with now so we won't pay
		# the cost in git to look up each individual file.
		my $o = watchman_clock();
		$error = $output->{error};

		die "Watchman: $error.\n" .
		"Falling back to scanning...\n" if $error;

		output_result($o->{clock}, ("/"));
		$last_update_token = $o->{clock};

		eval { launch_watchman() };
		return 0;
	}

	die "Watchman: $error.\n" .
	"Falling back to scanning...\n" if $error;

	return 1;
}

sub get_working_dir {
	my $working_dir;
	if ($^O =~ 'msys' || $^O =~ 'cygwin') {
		$working_dir = Win32::GetCwd();
		$working_dir =~ tr/\\/\//;
	} else {
		require Cwd;
		$working_dir = Cwd::cwd();
	}

	return $working_dir;
}

```

# .git_disabled/hooks/post-update.sample

```sample
#!/bin/sh
#
# An example hook script to prepare a packed repository for use over
# dumb transports.
#
# To enable this hook, rename this file to "post-update".

exec git update-server-info

```

# .git_disabled/hooks/pre-applypatch.sample

```sample
#!/bin/sh
#
# An example hook script to verify what is about to be committed
# by applypatch from an e-mail message.
#
# The hook should exit with non-zero status after issuing an
# appropriate message if it wants to stop the commit.
#
# To enable this hook, rename this file to "pre-applypatch".

. git-sh-setup
precommit="$(git rev-parse --git-path hooks/pre-commit)"
test -x "$precommit" && exec "$precommit" ${1+"$@"}
:

```

# .git_disabled/hooks/pre-commit.sample

```sample
#!/bin/sh
#
# An example hook script to verify what is about to be committed.
# Called by "git commit" with no arguments.  The hook should
# exit with non-zero status after issuing an appropriate message if
# it wants to stop the commit.
#
# To enable this hook, rename this file to "pre-commit".

if git rev-parse --verify HEAD >/dev/null 2>&1
then
	against=HEAD
else
	# Initial commit: diff against an empty tree object
	against=$(git hash-object -t tree /dev/null)
fi

# If you want to allow non-ASCII filenames set this variable to true.
allownonascii=$(git config --type=bool hooks.allownonascii)

# Redirect output to stderr.
exec 1>&2

# Cross platform projects tend to avoid non-ASCII filenames; prevent
# them from being added to the repository. We exploit the fact that the
# printable range starts at the space character and ends with tilde.
if [ "$allownonascii" != "true" ] &&
	# Note that the use of brackets around a tr range is ok here, (it's
	# even required, for portability to Solaris 10's /usr/bin/tr), since
	# the square bracket bytes happen to fall in the designated range.
	test $(git diff-index --cached --name-only --diff-filter=A -z $against |
	  LC_ALL=C tr -d '[ -~]\0' | wc -c) != 0
then
	cat <<\EOF
Error: Attempt to add a non-ASCII file name.

This can cause problems if you want to work with people on other platforms.

To be portable it is advisable to rename the file.

If you know what you are doing you can disable this check using:

  git config hooks.allownonascii true
EOF
	exit 1
fi

# If there are whitespace errors, print the offending file names and fail.
exec git diff-index --check --cached $against --

```

# .git_disabled/hooks/pre-merge-commit.sample

```sample
#!/bin/sh
#
# An example hook script to verify what is about to be committed.
# Called by "git merge" with no arguments.  The hook should
# exit with non-zero status after issuing an appropriate message to
# stderr if it wants to stop the merge commit.
#
# To enable this hook, rename this file to "pre-merge-commit".

. git-sh-setup
test -x "$GIT_DIR/hooks/pre-commit" &&
        exec "$GIT_DIR/hooks/pre-commit"
:

```

# .git_disabled/hooks/pre-push.sample

```sample
#!/bin/sh

# An example hook script to verify what is about to be pushed.  Called by "git
# push" after it has checked the remote status, but before anything has been
# pushed.  If this script exits with a non-zero status nothing will be pushed.
#
# This hook is called with the following parameters:
#
# $1 -- Name of the remote to which the push is being done
# $2 -- URL to which the push is being done
#
# If pushing without using a named remote those arguments will be equal.
#
# Information about the commits which are being pushed is supplied as lines to
# the standard input in the form:
#
#   <local ref> <local oid> <remote ref> <remote oid>
#
# This sample shows how to prevent push of commits where the log message starts
# with "WIP" (work in progress).

remote="$1"
url="$2"

zero=$(git hash-object --stdin </dev/null | tr '[0-9a-f]' '0')

while read local_ref local_oid remote_ref remote_oid
do
	if test "$local_oid" = "$zero"
	then
		# Handle delete
		:
	else
		if test "$remote_oid" = "$zero"
		then
			# New branch, examine all commits
			range="$local_oid"
		else
			# Update to existing branch, examine new commits
			range="$remote_oid..$local_oid"
		fi

		# Check for WIP commit
		commit=$(git rev-list -n 1 --grep '^WIP' "$range")
		if test -n "$commit"
		then
			echo >&2 "Found WIP commit in $local_ref, not pushing"
			exit 1
		fi
	fi
done

exit 0

```

# .git_disabled/hooks/pre-rebase.sample

```sample
#!/bin/sh
#
# Copyright (c) 2006, 2008 Junio C Hamano
#
# The "pre-rebase" hook is run just before "git rebase" starts doing
# its job, and can prevent the command from running by exiting with
# non-zero status.
#
# The hook is called with the following parameters:
#
# $1 -- the upstream the series was forked from.
# $2 -- the branch being rebased (or empty when rebasing the current branch).
#
# This sample shows how to prevent topic branches that are already
# merged to 'next' branch from getting rebased, because allowing it
# would result in rebasing already published history.

publish=next
basebranch="$1"
if test "$#" = 2
then
	topic="refs/heads/$2"
else
	topic=`git symbolic-ref HEAD` ||
	exit 0 ;# we do not interrupt rebasing detached HEAD
fi

case "$topic" in
refs/heads/??/*)
	;;
*)
	exit 0 ;# we do not interrupt others.
	;;
esac

# Now we are dealing with a topic branch being rebased
# on top of master.  Is it OK to rebase it?

# Does the topic really exist?
git show-ref -q "$topic" || {
	echo >&2 "No such branch $topic"
	exit 1
}

# Is topic fully merged to master?
not_in_master=`git rev-list --pretty=oneline ^master "$topic"`
if test -z "$not_in_master"
then
	echo >&2 "$topic is fully merged to master; better remove it."
	exit 1 ;# we could allow it, but there is no point.
fi

# Is topic ever merged to next?  If so you should not be rebasing it.
only_next_1=`git rev-list ^master "^$topic" ${publish} | sort`
only_next_2=`git rev-list ^master           ${publish} | sort`
if test "$only_next_1" = "$only_next_2"
then
	not_in_topic=`git rev-list "^$topic" master`
	if test -z "$not_in_topic"
	then
		echo >&2 "$topic is already up to date with master"
		exit 1 ;# we could allow it, but there is no point.
	else
		exit 0
	fi
else
	not_in_next=`git rev-list --pretty=oneline ^${publish} "$topic"`
	/usr/bin/perl -e '
		my $topic = $ARGV[0];
		my $msg = "* $topic has commits already merged to public branch:\n";
		my (%not_in_next) = map {
			/^([0-9a-f]+) /;
			($1 => 1);
		} split(/\n/, $ARGV[1]);
		for my $elem (map {
				/^([0-9a-f]+) (.*)$/;
				[$1 => $2];
			} split(/\n/, $ARGV[2])) {
			if (!exists $not_in_next{$elem->[0]}) {
				if ($msg) {
					print STDERR $msg;
					undef $msg;
				}
				print STDERR " $elem->[1]\n";
			}
		}
	' "$topic" "$not_in_next" "$not_in_master"
	exit 1
fi

<<\DOC_END

This sample hook safeguards topic branches that have been
published from being rewound.

The workflow assumed here is:

 * Once a topic branch forks from "master", "master" is never
   merged into it again (either directly or indirectly).

 * Once a topic branch is fully cooked and merged into "master",
   it is deleted.  If you need to build on top of it to correct
   earlier mistakes, a new topic branch is created by forking at
   the tip of the "master".  This is not strictly necessary, but
   it makes it easier to keep your history simple.

 * Whenever you need to test or publish your changes to topic
   branches, merge them into "next" branch.

The script, being an example, hardcodes the publish branch name
to be "next", but it is trivial to make it configurable via
$GIT_DIR/config mechanism.

With this workflow, you would want to know:

(1) ... if a topic branch has ever been merged to "next".  Young
    topic branches can have stupid mistakes you would rather
    clean up before publishing, and things that have not been
    merged into other branches can be easily rebased without
    affecting other people.  But once it is published, you would
    not want to rewind it.

(2) ... if a topic branch has been fully merged to "master".
    Then you can delete it.  More importantly, you should not
    build on top of it -- other people may already want to
    change things related to the topic as patches against your
    "master", so if you need further changes, it is better to
    fork the topic (perhaps with the same name) afresh from the
    tip of "master".

Let's look at this example:

		   o---o---o---o---o---o---o---o---o---o "next"
		  /       /           /           /
		 /   a---a---b A     /           /
		/   /               /           /
	       /   /   c---c---c---c B         /
	      /   /   /             \         /
	     /   /   /   b---b C     \       /
	    /   /   /   /             \     /
    ---o---o---o---o---o---o---o---o---o---o---o "master"


A, B and C are topic branches.

 * A has one fix since it was merged up to "next".

 * B has finished.  It has been fully merged up to "master" and "next",
   and is ready to be deleted.

 * C has not merged to "next" at all.

We would want to allow C to be rebased, refuse A, and encourage
B to be deleted.

To compute (1):

	git rev-list ^master ^topic next
	git rev-list ^master        next

	if these match, topic has not merged in next at all.

To compute (2):

	git rev-list master..topic

	if this is empty, it is fully merged to "master".

DOC_END

```

# .git_disabled/hooks/pre-receive.sample

```sample
#!/bin/sh
#
# An example hook script to make use of push options.
# The example simply echoes all push options that start with 'echoback='
# and rejects all pushes when the "reject" push option is used.
#
# To enable this hook, rename this file to "pre-receive".

if test -n "$GIT_PUSH_OPTION_COUNT"
then
	i=0
	while test "$i" -lt "$GIT_PUSH_OPTION_COUNT"
	do
		eval "value=\$GIT_PUSH_OPTION_$i"
		case "$value" in
		echoback=*)
			echo "echo from the pre-receive-hook: ${value#*=}" >&2
			;;
		reject)
			exit 1
		esac
		i=$((i + 1))
	done
fi

```

# .git_disabled/hooks/prepare-commit-msg.sample

```sample
#!/bin/sh
#
# An example hook script to prepare the commit log message.
# Called by "git commit" with the name of the file that has the
# commit message, followed by the description of the commit
# message's source.  The hook's purpose is to edit the commit
# message file.  If the hook fails with a non-zero status,
# the commit is aborted.
#
# To enable this hook, rename this file to "prepare-commit-msg".

# This hook includes three examples. The first one removes the
# "# Please enter the commit message..." help message.
#
# The second includes the output of "git diff --name-status -r"
# into the message, just before the "git status" output.  It is
# commented because it doesn't cope with --amend or with squashed
# commits.
#
# The third example adds a Signed-off-by line to the message, that can
# still be edited.  This is rarely a good idea.

COMMIT_MSG_FILE=$1
COMMIT_SOURCE=$2
SHA1=$3

/usr/bin/perl -i.bak -ne 'print unless(m/^. Please enter the commit message/..m/^#$/)' "$COMMIT_MSG_FILE"

# case "$COMMIT_SOURCE,$SHA1" in
#  ,|template,)
#    /usr/bin/perl -i.bak -pe '
#       print "\n" . `git diff --cached --name-status -r`
# 	 if /^#/ && $first++ == 0' "$COMMIT_MSG_FILE" ;;
#  *) ;;
# esac

# SOB=$(git var GIT_COMMITTER_IDENT | sed -n 's/^\(.*>\).*$/Signed-off-by: \1/p')
# git interpret-trailers --in-place --trailer "$SOB" "$COMMIT_MSG_FILE"
# if test -z "$COMMIT_SOURCE"
# then
#   /usr/bin/perl -i.bak -pe 'print "\n" if !$first_line++' "$COMMIT_MSG_FILE"
# fi

```

# .git_disabled/hooks/push-to-checkout.sample

```sample
#!/bin/sh

# An example hook script to update a checked-out tree on a git push.
#
# This hook is invoked by git-receive-pack(1) when it reacts to git
# push and updates reference(s) in its repository, and when the push
# tries to update the branch that is currently checked out and the
# receive.denyCurrentBranch configuration variable is set to
# updateInstead.
#
# By default, such a push is refused if the working tree and the index
# of the remote repository has any difference from the currently
# checked out commit; when both the working tree and the index match
# the current commit, they are updated to match the newly pushed tip
# of the branch. This hook is to be used to override the default
# behaviour; however the code below reimplements the default behaviour
# as a starting point for convenient modification.
#
# The hook receives the commit with which the tip of the current
# branch is going to be updated:
commit=$1

# It can exit with a non-zero status to refuse the push (when it does
# so, it must not modify the index or the working tree).
die () {
	echo >&2 "$*"
	exit 1
}

# Or it can make any necessary changes to the working tree and to the
# index to bring them to the desired state when the tip of the current
# branch is updated to the new commit, and exit with a zero status.
#
# For example, the hook can simply run git read-tree -u -m HEAD "$1"
# in order to emulate git fetch that is run in the reverse direction
# with git push, as the two-tree form of git read-tree -u -m is
# essentially the same as git switch or git checkout that switches
# branches while keeping the local changes in the working tree that do
# not interfere with the difference between the branches.

# The below is a more-or-less exact translation to shell of the C code
# for the default behaviour for git's push-to-checkout hook defined in
# the push_to_deploy() function in builtin/receive-pack.c.
#
# Note that the hook will be executed from the repository directory,
# not from the working tree, so if you want to perform operations on
# the working tree, you will have to adapt your code accordingly, e.g.
# by adding "cd .." or using relative paths.

if ! git update-index -q --ignore-submodules --refresh
then
	die "Up-to-date check failed"
fi

if ! git diff-files --quiet --ignore-submodules --
then
	die "Working directory has unstaged changes"
fi

# This is a rough translation of:
#
#   head_has_history() ? "HEAD" : EMPTY_TREE_SHA1_HEX
if git cat-file -e HEAD 2>/dev/null
then
	head=HEAD
else
	head=$(git hash-object -t tree --stdin </dev/null)
fi

if ! git diff-index --quiet --cached --ignore-submodules $head --
then
	die "Working directory has staged changes"
fi

if ! git read-tree -u -m "$commit"
then
	die "Could not update working tree to new HEAD"
fi

```

# .git_disabled/hooks/sendemail-validate.sample

```sample
#!/bin/sh

# An example hook script to validate a patch (and/or patch series) before
# sending it via email.
#
# The hook should exit with non-zero status after issuing an appropriate
# message if it wants to prevent the email(s) from being sent.
#
# To enable this hook, rename this file to "sendemail-validate".
#
# By default, it will only check that the patch(es) can be applied on top of
# the default upstream branch without conflicts in a secondary worktree. After
# validation (successful or not) of the last patch of a series, the worktree
# will be deleted.
#
# The following config variables can be set to change the default remote and
# remote ref that are used to apply the patches against:
#
#   sendemail.validateRemote (default: origin)
#   sendemail.validateRemoteRef (default: HEAD)
#
# Replace the TODO placeholders with appropriate checks according to your
# needs.

validate_cover_letter () {
	file="$1"
	# TODO: Replace with appropriate checks (e.g. spell checking).
	true
}

validate_patch () {
	file="$1"
	# Ensure that the patch applies without conflicts.
	git am -3 "$file" || return
	# TODO: Replace with appropriate checks for this patch
	# (e.g. checkpatch.pl).
	true
}

validate_series () {
	# TODO: Replace with appropriate checks for the whole series
	# (e.g. quick build, coding style checks, etc.).
	true
}

# main -------------------------------------------------------------------------

if test "$GIT_SENDEMAIL_FILE_COUNTER" = 1
then
	remote=$(git config --default origin --get sendemail.validateRemote) &&
	ref=$(git config --default HEAD --get sendemail.validateRemoteRef) &&
	worktree=$(mktemp --tmpdir -d sendemail-validate.XXXXXXX) &&
	git worktree add -fd --checkout "$worktree" "refs/remotes/$remote/$ref" &&
	git config --replace-all sendemail.validateWorktree "$worktree"
else
	worktree=$(git config --get sendemail.validateWorktree)
fi || {
	echo "sendemail-validate: error: failed to prepare worktree" >&2
	exit 1
}

unset GIT_DIR GIT_WORK_TREE
cd "$worktree" &&

if grep -q "^diff --git " "$1"
then
	validate_patch "$1"
else
	validate_cover_letter "$1"
fi &&

if test "$GIT_SENDEMAIL_FILE_COUNTER" = "$GIT_SENDEMAIL_FILE_TOTAL"
then
	git config --unset-all sendemail.validateWorktree &&
	trap 'git worktree remove -ff "$worktree"' EXIT &&
	validate_series
fi

```

# .git_disabled/hooks/update.sample

```sample
#!/bin/sh
#
# An example hook script to block unannotated tags from entering.
# Called by "git receive-pack" with arguments: refname sha1-old sha1-new
#
# To enable this hook, rename this file to "update".
#
# Config
# ------
# hooks.allowunannotated
#   This boolean sets whether unannotated tags will be allowed into the
#   repository.  By default they won't be.
# hooks.allowdeletetag
#   This boolean sets whether deleting tags will be allowed in the
#   repository.  By default they won't be.
# hooks.allowmodifytag
#   This boolean sets whether a tag may be modified after creation. By default
#   it won't be.
# hooks.allowdeletebranch
#   This boolean sets whether deleting branches will be allowed in the
#   repository.  By default they won't be.
# hooks.denycreatebranch
#   This boolean sets whether remotely creating branches will be denied
#   in the repository.  By default this is allowed.
#

# --- Command line
refname="$1"
oldrev="$2"
newrev="$3"

# --- Safety check
if [ -z "$GIT_DIR" ]; then
	echo "Don't run this script from the command line." >&2
	echo " (if you want, you could supply GIT_DIR then run" >&2
	echo "  $0 <ref> <oldrev> <newrev>)" >&2
	exit 1
fi

if [ -z "$refname" -o -z "$oldrev" -o -z "$newrev" ]; then
	echo "usage: $0 <ref> <oldrev> <newrev>" >&2
	exit 1
fi

# --- Config
allowunannotated=$(git config --type=bool hooks.allowunannotated)
allowdeletebranch=$(git config --type=bool hooks.allowdeletebranch)
denycreatebranch=$(git config --type=bool hooks.denycreatebranch)
allowdeletetag=$(git config --type=bool hooks.allowdeletetag)
allowmodifytag=$(git config --type=bool hooks.allowmodifytag)

# check for no description
projectdesc=$(sed -e '1q' "$GIT_DIR/description")
case "$projectdesc" in
"Unnamed repository"* | "")
	echo "*** Project description file hasn't been set" >&2
	exit 1
	;;
esac

# --- Check types
# if $newrev is 0000...0000, it's a commit to delete a ref.
zero=$(git hash-object --stdin </dev/null | tr '[0-9a-f]' '0')
if [ "$newrev" = "$zero" ]; then
	newrev_type=delete
else
	newrev_type=$(git cat-file -t $newrev)
fi

case "$refname","$newrev_type" in
	refs/tags/*,commit)
		# un-annotated tag
		short_refname=${refname##refs/tags/}
		if [ "$allowunannotated" != "true" ]; then
			echo "*** The un-annotated tag, $short_refname, is not allowed in this repository" >&2
			echo "*** Use 'git tag [ -a | -s ]' for tags you want to propagate." >&2
			exit 1
		fi
		;;
	refs/tags/*,delete)
		# delete tag
		if [ "$allowdeletetag" != "true" ]; then
			echo "*** Deleting a tag is not allowed in this repository" >&2
			exit 1
		fi
		;;
	refs/tags/*,tag)
		# annotated tag
		if [ "$allowmodifytag" != "true" ] && git rev-parse $refname > /dev/null 2>&1
		then
			echo "*** Tag '$refname' already exists." >&2
			echo "*** Modifying a tag is not allowed in this repository." >&2
			exit 1
		fi
		;;
	refs/heads/*,commit)
		# branch
		if [ "$oldrev" = "$zero" -a "$denycreatebranch" = "true" ]; then
			echo "*** Creating a branch is not allowed in this repository" >&2
			exit 1
		fi
		;;
	refs/heads/*,delete)
		# delete branch
		if [ "$allowdeletebranch" != "true" ]; then
			echo "*** Deleting a branch is not allowed in this repository" >&2
			exit 1
		fi
		;;
	refs/remotes/*,commit)
		# tracking branch
		;;
	refs/remotes/*,delete)
		# delete tracking branch
		if [ "$allowdeletebranch" != "true" ]; then
			echo "*** Deleting a tracking branch is not allowed in this repository" >&2
			exit 1
		fi
		;;
	*)
		# Anything else (is there anything else?)
		echo "*** Update hook: unknown type of update to ref $refname of type $newrev_type" >&2
		exit 1
		;;
esac

# --- Finished
exit 0

```

# .git_disabled/info/exclude

```
# git ls-files --others --exclude-from=.git/info/exclude
# Lines that start with '#' are comments.
# For a project mostly in C, the following would be a good set of
# exclude patterns (uncomment them if you want to use them):
# *.[oa]
# *~

```

# .prettierrc.json

```json
{
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}

```

# .vscode/extensions.json

```json
{
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=827846
  "recommendations": ["angular.ng-template"]
}

```

# .vscode/launch.json

```json
{
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      "name": "ng serve",
      "type": "chrome",
      "request": "launch",
      "preLaunchTask": "npm: start",
      "url": "http://localhost:4200/"
    },
    {
      "name": "ng test",
      "type": "chrome",
      "request": "launch",
      "preLaunchTask": "npm: test",
      "url": "http://localhost:9876/debug.html"
    }
  ]
}

```

# .vscode/tasks.json

```json
{
  // For more information, visit: https://go.microsoft.com/fwlink/?LinkId=733558
  "version": "2.0.0",
  "tasks": [
    {
      "type": "npm",
      "script": "start",
      "isBackground": true,
      "problemMatcher": {
        "owner": "typescript",
        "pattern": "$tsc",
        "background": {
          "activeOnStart": true,
          "beginsPattern": {
            "regexp": "(.*?)"
          },
          "endsPattern": {
            "regexp": "bundle generation complete"
          }
        }
      }
    },
    {
      "type": "npm",
      "script": "test",
      "isBackground": true,
      "problemMatcher": {
        "owner": "typescript",
        "pattern": "$tsc",
        "background": {
          "activeOnStart": true,
          "beginsPattern": {
            "regexp": "(.*?)"
          },
          "endsPattern": {
            "regexp": "bundle generation complete"
          }
        }
      }
    }
  ]
}

```

# angular.json

```json
{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "cli": {
    "packageManager": "npm",
    "analytics": "117fff0d-bf96-4847-ae82-06617264c594"
  },
  "newProjectRoot": "projects",
  "projects": {
    "storefront": {
      "projectType": "application",
      "schematics": {
        "@schematics/angular:component": {
          "style": "scss"
        }
      },
      "root": "projects/storefront",
      "sourceRoot": "projects/storefront/src",
      "prefix": "app",
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          "options": {
            "outputPath": "dist/storefront",
            "index": "projects/storefront/src/index.html",
            "browser": "projects/storefront/src/main.ts",
            "polyfills": [
              "zone.js"
            ],
            "tsConfig": "projects/storefront/tsconfig.app.json",
            "inlineStyleLanguage": "scss",
            "assets": [
              {
                "glob": "**/*",
                "input": "projects/storefront/public"
              }
            ],
            "styles": [
              "projects/storefront/src/styles.scss"
            ],
            "scripts": []
          },
          "configurations": {
            "production": {
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "500kB",
                  "maximumError": "1MB"
                },
                {
                  "type": "anyComponentStyle",
                  "maximumWarning": "4kB",
                  "maximumError": "8kB"
                }
              ],
              "outputHashing": "all"
            },
            "development": {
              "optimization": false,
              "extractLicenses": false,
              "sourceMap": true
            }
          },
          "defaultConfiguration": "production"
        },
        "serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          "options": {
            "proxyConfig": "proxy.conf.json"
          },
          "configurations": {
            "production": {
              "buildTarget": "storefront:build:production"
            },
            "development": {
              "buildTarget": "storefront:build:development"
            }
          },
          "defaultConfiguration": "development"
        },
        "extract-i18n": {
          "builder": "@angular-devkit/build-angular:extract-i18n"
        },
        "test": {
          "builder": "@angular-devkit/build-angular:karma",
          "options": {
            "polyfills": [
              "zone.js",
              "zone.js/testing"
            ],
            "tsConfig": "projects/storefront/tsconfig.spec.json",
            "inlineStyleLanguage": "scss",
            "assets": [
              {
                "glob": "**/*",
                "input": "projects/storefront/public"
              }
            ],
            "styles": [
              "projects/storefront/src/styles.scss"
            ],
            "scripts": []
          }
        }
      }
    },
    "store-management": {
      "projectType": "application",
      "schematics": {
        "@schematics/angular:component": {
          "style": "scss"
        }
      },
      "root": "projects/store-management",
      "sourceRoot": "projects/store-management/src",
      "prefix": "app",
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          "options": {
            "outputPath": "dist/store-management",
            "index": "projects/store-management/src/index.html",
            "browser": "projects/store-management/src/main.ts",
            "polyfills": [
              "zone.js"
            ],
            "tsConfig": "projects/store-management/tsconfig.app.json",
            "inlineStyleLanguage": "scss",
            "assets": [
              {
                "glob": "**/*",
                "input": "projects/store-management/public"
              }
            ],
            "styles": [
              "projects/store-management/src/styles.scss"
            ],
            "scripts": []
          },
          "configurations": {
            "production": {
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "500kB",
                  "maximumError": "1MB"
                },
                {
                  "type": "anyComponentStyle",
                  "maximumWarning": "2kB",
                  "maximumError": "4kB"
                }
              ],
              "outputHashing": "all"
            },
            "development": {
              "optimization": false,
              "extractLicenses": false,
              "sourceMap": true
            }
          },
          "defaultConfiguration": "production"
        },
        "serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          "configurations": {
            "production": {
              "buildTarget": "store-management:build:production"
            },
            "development": {
              "buildTarget": "store-management:build:development"
            }
          },
          "defaultConfiguration": "development"
        },
        "extract-i18n": {
          "builder": "@angular-devkit/build-angular:extract-i18n"
        },
        "test": {
          "builder": "@angular-devkit/build-angular:karma",
          "options": {
            "polyfills": [
              "zone.js",
              "zone.js/testing"
            ],
            "tsConfig": "projects/store-management/tsconfig.spec.json",
            "inlineStyleLanguage": "scss",
            "assets": [
              {
                "glob": "**/*",
                "input": "projects/store-management/public"
              }
            ],
            "styles": [
              "projects/store-management/src/styles.scss"
            ],
            "scripts": []
          }
        }
      }
    },
    "shared-types": {
      "projectType": "library",
      "root": "projects/shared-types",
      "sourceRoot": "projects/shared-types/src",
      "prefix": "lib",
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:ng-packagr",
          "options": {
            "project": "projects/shared-types/ng-package.json"
          },
          "configurations": {
            "production": {
              "tsConfig": "projects/shared-types/tsconfig.lib.prod.json"
            },
            "development": {
              "tsConfig": "projects/shared-types/tsconfig.lib.json"
            }
          },
          "defaultConfiguration": "production"
        },
        "test": {
          "builder": "@angular-devkit/build-angular:karma",
          "options": {
            "tsConfig": "projects/shared-types/tsconfig.spec.json",
            "polyfills": [
              "zone.js",
              "zone.js/testing"
            ]
          }
        }
      }
    },
    "global-marketplace": {
      "projectType": "application",
      "schematics": {
        "@schematics/angular:component": {
          "style": "scss"
        }
      },
      "root": "projects/global-marketplace",
      "sourceRoot": "projects/global-marketplace/src",
      "prefix": "app",
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          "options": {
            "outputPath": "dist/global-marketplace",
            "index": "projects/global-marketplace/src/index.html",
            "browser": "projects/global-marketplace/src/main.ts",
            "polyfills": [
              "zone.js"
            ],
            "tsConfig": "projects/global-marketplace/tsconfig.app.json",
            "inlineStyleLanguage": "scss",
            "assets": [
              {
                "glob": "**/*",
                "input": "projects/global-marketplace/public"
              }
            ],
            "styles": [
              "projects/global-marketplace/src/styles.scss"
            ],
            "scripts": []
          },
          "configurations": {
            "production": {
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "500kB",
                  "maximumError": "1MB"
                },
                {
                  "type": "anyComponentStyle",
                  "maximumWarning": "2kB",
                  "maximumError": "4kB"
                }
              ],
              "outputHashing": "all"
            },
            "development": {
              "optimization": false,
              "extractLicenses": false,
              "sourceMap": true
            }
          },
          "defaultConfiguration": "production"
        },
        "serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          "configurations": {
            "production": {
              "buildTarget": "global-marketplace:build:production"
            },
            "development": {
              "buildTarget": "global-marketplace:build:development"
            }
          },
          "defaultConfiguration": "development"
        },
        "extract-i18n": {
          "builder": "@angular-devkit/build-angular:extract-i18n"
        },
        "test": {
          "builder": "@angular-devkit/build-angular:karma",
          "options": {
            "polyfills": [
              "zone.js",
              "zone.js/testing"
            ],
            "tsConfig": "projects/global-marketplace/tsconfig.spec.json",
            "inlineStyleLanguage": "scss",
            "assets": [
              {
                "glob": "**/*",
                "input": "projects/global-marketplace/public"
              }
            ],
            "styles": [
              "projects/global-marketplace/src/styles.scss"
            ],
            "scripts": []
          }
        }
      }
    }
  }
}

```

# backend/api/.prettierrc

```
{
  "singleQuote": true,
  "trailingComma": "all"
}
```

# backend/api/data-source.ts

```ts
import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductEntity } from './src/products/entities/product.entity';
import { CategoryEntity } from './src/categories/entities/category.entity';
import { StoreEntity } from './src/stores/entities/store.entity'; // Import StoreEntity
import { UserEntity } from './src/users/entities/user.entity'; // Import UserEntity
// Import other entities as they are created
// Load environment variables directly for CLI usage
// Note: NestJS app uses ConfigModule, but CLI needs direct access
import * as dotenv from 'dotenv';
dotenv.config(); // Load .env file if present (optional, Docker Compose provides env vars)

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'db', // Default to Docker service name 'db'
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password', // Ensure POSTGRES_PASSWORD is set in .env or via Docker Compose
  database: process.env.POSTGRES_DB || 'magic_store_prod', // Match DB name used in compose
  entities: [
    ProductEntity,
    CategoryEntity,
    StoreEntity,
    UserEntity, // Add UserEntity here
    // Add other entities here
    // __dirname + '/../**/*.entity{.ts,.js}', // Alternative: Use glob pattern
  ],
  migrations: [__dirname + '/src/migrations/*{.ts,.js}'], // Path to migration files
  synchronize: false, // IMPORTANT: Set to false for production and migration use
  logging: process.env.NODE_ENV === 'development', // Log SQL in dev
};

// Export a DataSource instance for TypeORM CLI
const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
```

# backend/api/Dockerfile.prod

```prod
# Stage 1: Build the application
FROM node:20-slim AS builder

WORKDIR /usr/src/app

# Copy only package files first for better caching
COPY package.json package-lock.json* ./
COPY backend/api/package.json backend/api/package-lock.json* ./backend/api/

# Install root dependencies and backend dependencies
# This layer is cached as long as lock files don't change
RUN npm install
RUN cd backend/api && npm install

# Now copy the rest of the necessary files for the build
COPY tsconfig.json ./
# Copy the entire shared-types project directory
COPY projects/shared-types ./projects/shared-types

# Copy pre-built shared-types library (assuming it's built before this stage)
# This still relies on the local build, but happens after npm install
COPY dist/shared-types ./dist/shared-types

# Copy the rest of the backend source code
# This layer is invalidated more often, but npm install is cached
COPY backend/api/ ./backend/api/

# Build the NestJS application
RUN cd backend/api && npm run build

# Stage 2: Create the production image
FROM node:20-slim AS production

WORKDIR /usr/src/app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy only necessary files from the builder stage
# Copy node_modules separately for potential layer reuse
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/backend/api/node_modules ./backend/api/node_modules
# Copy built application
COPY --from=builder /usr/src/app/backend/api/dist ./backend/api/dist
# Copy backend package.json for running the app
COPY --from=builder /usr/src/app/backend/api/package.json ./backend/api/package.json

# Expose the port the app runs on (NestJS default is 3000)
# This is internal to Docker; Nginx will handle external exposure
EXPOSE 3000

# Command to run the application
CMD ["node", "backend/api/dist/src/main"]

```

# backend/api/eslint.config.mjs

```mjs
// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 5,
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn'
    },
  },
);
```

# backend/api/nest-cli.json

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}

```

# backend/api/package.json

```json
{
  "name": "api",
  "version": "0.0.1",
  "description": "",
  "author": "",
  "private": true,
  "license": "UNLICENSED",
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "seed": "ts-node -r tsconfig-paths/register src/seed.ts",
    "seed:prod": "node dist/src/seed.js",
    "typeorm": "typeorm-ts-node-commonjs -d dist/data-source.js",
    "migration:generate": "npm run typeorm -- migration:generate src/migrations/",
    "migration:run": "npm run typeorm -- migration:run",
    "migration:revert": "npm run typeorm -- migration:revert"
  },
  "dependencies": {
    "@nestjs/common": "^11.0.1",
    "@nestjs/config": "^4.0.2",
    "@nestjs/core": "^11.0.1",
    "@nestjs/jwt": "^11.0.0",
    "@nestjs/passport": "^11.0.5",
    "@nestjs/platform-express": "^11.0.1",
    "@nestjs/typeorm": "^11.0.0",
    "@types/bcrypt": "^5.0.2",
    "@types/passport-jwt": "^4.0.1",
    "bcrypt": "^5.1.1",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "pg": "^8.14.1",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1",
    "typeorm": "^0.3.21"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3.2.0",
    "@eslint/js": "^9.18.0",
    "@nestjs/cli": "^11.0.0",
    "@nestjs/schematics": "^11.0.0",
    "@nestjs/testing": "^11.0.1",
    "@swc/cli": "^0.6.0",
    "@swc/core": "^1.10.7",
    "@types/express": "^5.0.0",
    "@types/jest": "^29.5.14",
    "@types/node": "^22.10.7",
    "@types/supertest": "^6.0.2",
    "dotenv": "^16.4.7",
    "eslint": "^9.18.0",
    "eslint-config-prettier": "^10.0.1",
    "eslint-plugin-prettier": "^5.2.2",
    "globals": "^16.0.0",
    "jest": "^29.7.0",
    "prettier": "^3.4.2",
    "source-map-support": "^0.5.21",
    "supertest": "^7.0.0",
    "ts-jest": "^29.2.5",
    "ts-loader": "^9.5.2",
    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.7.3",
    "typescript-eslint": "^8.20.0"
  },
  "jest": {
    "moduleFileExtensions": [
      "js",
      "json",
      "ts"
    ],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
      "**/*.(t|j)s"
    ],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}

```

# backend/api/src/account/account.controller.ts

```ts
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Import the guard
import { UserEntity } from '../users/entities/user.entity'; // Import UserEntity

// Define the shape of the request object after JWT validation
interface AuthenticatedRequest extends Request {
  user: Omit<UserEntity, 'passwordHash'>; // User payload attached by JwtStrategy.validate
}

@Controller('account') // Base path for account-related endpoints
export class AccountController {
  // Constructor could inject services if needed for more complex logic

  @UseGuards(JwtAuthGuard) // Protect this route with the JWT guard
  @Get('profile') // Endpoint: GET /api/account/profile
  getProfile(@Request() req: AuthenticatedRequest) {
    // The JwtAuthGuard ensures req.user is populated with the validated user payload
    // from the JWT (as returned by JwtStrategy.validate)
    return req.user; // Return the user details (excluding password hash)
  }

  // Add other account endpoints here later (e.g., update profile, get orders)
  // @Get('orders')
  // @UseGuards(JwtAuthGuard)
  // getOrders(@Request() req: AuthenticatedRequest) { ... }

  // @Patch('profile')
  // @UseGuards(JwtAuthGuard)
  // updateProfile(@Request() req: AuthenticatedRequest, @Body() updateDto: UpdateProfileDto) { ... }
}
```

# backend/api/src/account/account.module.ts

```ts
import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule if guards/strategies are needed here (often not directly)

@Module({
  imports: [AuthModule], // Import AuthModule to ensure Passport/JWT setup is available application-wide
  controllers: [AccountController],
  providers: [], // Add services specific to account management later
})
export class AccountModule {}
```

# backend/api/src/app.controller.spec.ts

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});

```

# backend/api/src/app.controller.ts

```ts
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

```

# backend/api/src/app.module.ts

```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { CartModule } from './cart/cart.module';
import { AccountModule } from './account/account.module'; // Import AccountModule
import { StoresModule } from './stores/stores.module'; // Import StoresModule
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make ConfigModule available globally
      envFilePath: '.env', // Specify path to .env file (optional, defaults might work)
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST', 'localhost'),
        port: configService.get<number>('POSTGRES_PORT', 5432),
        username: configService.get<string>('POSTGRES_USER', 'postgres'),
        password: configService.get<string>('POSTGRES_PASSWORD', 'password'), // Replace 'password' with a secure default or leave empty if needed
        database: configService.get<string>('POSTGRES_DB', 'magic_store'), // Default DB name
        entities: [], // Will be populated later or use autoLoadEntities
        autoLoadEntities: true, // Automatically load entities registered via forFeature()
        synchronize: configService.get<string>('NODE_ENV') !== 'production', // Sync schema in dev, disable in prod
        logging: configService.get<string>('NODE_ENV') !== 'production', // Log SQL in dev
      }),
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    CartModule,
    AccountModule, // Add AccountModule here
    StoresModule, // Add StoresModule here
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

```

# backend/api/src/app.service.ts

```ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}

```

# backend/api/src/auth/auth.controller.ts

```ts
import { Controller, Post, Body, UsePipes, ValidationPipe, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service'; // Import AuthService
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto'; // Import LoginUserDto

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService, // Inject AuthService
  ) {}

  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) // Apply validation
  @HttpCode(HttpStatus.CREATED) // Return 201 Created on success
  async register(@Body() createUserDto: CreateUserDto) {
    // The ValidationPipe handles input validation based on DTO decorators
    const user = await this.usersService.create(createUserDto);
    // Return the created user (without password hash)
    return {
       message: 'Registration successful',
       user: user
    };
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @HttpCode(HttpStatus.OK) // Return 200 OK on success
  async login(@Body() loginUserDto: LoginUserDto) {
    const user = await this.authService.validateUser(loginUserDto.email, loginUserDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // If validation is successful, AuthService.login generates and returns the JWT
    return this.authService.login(user);
  }
}

```

# backend/api/src/auth/auth.module.ts

```ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Import ConfigModule and ConfigService
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service'; // Import AuthService
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy'; // Import JwtStrategy

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({ // Configure JwtModule asynchronously
      imports: [ConfigModule], // Import ConfigModule to use ConfigService
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        // Provide a default value like '1d' if the env var is missing
        const expiresIn = configService.get<string>('JWT_EXPIRATION_TIME', '1d');

        // Log the values to check if they are being read correctly
        console.log('JWT Secret:', secret ? 'Loaded' : 'MISSING');
        console.log('JWT ExpiresIn:', expiresIn);

        if (!secret) {
          console.error('FATAL ERROR: JWT_SECRET environment variable is not set.');
          // Optionally throw an error to prevent startup without secret
          // throw new Error('JWT_SECRET environment variable is not set.');
        }

        return {
          secret: secret,
          signOptions: { expiresIn: expiresIn },
        };
      },
      inject: [ConfigService], // Inject ConfigService
    }),
    ConfigModule, // Make sure ConfigModule is imported if not globally available
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // Provide AuthService and JwtStrategy
  exports: [AuthService], // Export AuthService if needed elsewhere
})
export class AuthModule {}

```

# backend/api/src/auth/auth.service.ts

```ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../users/entities/user.entity'; // Use the actual entity class name

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<Omit<UserEntity, 'passwordHash'> | null> {
    const user = await this.usersService.findOneByEmail(email); // findOneByEmail should return UserEntity | null
    if (user && await bcrypt.compare(pass, user.passwordHash)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...result } = user; // Use passwordHash and remove it
      return result;
    }
    return null;
  }

  async login(user: Omit<UserEntity, 'passwordHash'>) {
    const payload = { email: user.email, sub: user.id }; // Use 'sub' for user ID as per JWT standard
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // Registration logic is likely handled directly in AuthController calling UsersService.create
  // Or could be moved here if more complex auth logic is needed during registration.
}
```

# backend/api/src/auth/dto/login-user.dto.ts

```ts
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';

export class LoginUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @IsNotEmpty({ message: 'Email should not be empty.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password should not be empty.' })
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  password: string;

  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean; // Add optional rememberMe field
}
```

# backend/api/src/auth/jwt-auth.guard.ts

```ts
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Optional: Override handleRequest to customize error handling or logic after validation
  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      // Log the error/info for debugging if needed
      console.error('JwtAuthGuard Error:', err || info?.message);
      throw err || new UnauthorizedException('Authentication token is invalid or expired.');
    }
    // If authentication is successful, Passport attaches the user object to the request.
    return user; // Return the user object to be attached to req.user
  }

  // Optional: Override canActivate for more complex logic before strategy execution
  // canActivate(context: ExecutionContext) {
  //   // Add your custom authentication logic here
  //   // for example, call super.logIn(request) to establish a session.
  //   return super.canActivate(context);
  // }
}
```

# backend/api/src/auth/jwt.strategy.ts

```ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service'; // Import UsersService if needed for validation

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService, // Inject UsersService
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      // Throw an error during initialization if the secret is missing
      throw new Error('JWT_SECRET environment variable is not set. Please check your .env file.');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Ensure expired tokens are rejected
      secretOrKey: jwtSecret, // Pass the validated secret
    });
  }

  // Passport first verifies the JWT's signature and decodes the JSON.
  // It then invokes our validate() method passing the decoded JSON as its single parameter.
  async validate(payload: { sub: string; email: string }) {
    // We could fetch the full user entity here if needed for more complex validation/roles
    const user = await this.usersService.findOneById(payload.sub); // Use findOneById
    if (!user) {
      throw new UnauthorizedException();
    }
    // We can trust the payload because Passport already verified the signature.
    // We return the user ID and email (or the full user object if needed downstream).
    // This return value becomes req.user in guarded routes.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...result } = user; // Exclude password hash
    return result; // Or return { userId: payload.sub, email: payload.email }; if full user not needed
  }
}
```

# backend/api/src/cart/cart.controller.ts

```ts
import { Controller, Post, Body, HttpCode, HttpStatus, Get, Patch, Delete, Param, ParseIntPipe } from '@nestjs/common'; // Added Get, Patch, Delete, Param, ParseIntPipe
import { CartService, AddToCartDto } from './cart.service'; // Import service and DTO

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {} // Inject service

  @Post('add') // Handle POST /cart/add
  @HttpCode(HttpStatus.OK) // Return 200 OK on success by default for POST if needed
  async addItemToCart(@Body() addToCartDto: AddToCartDto) {
    // TODO: Add validation pipe later for addToCartDto
    return this.cartService.addItem(addToCartDto);
  }

  @Get()
  async getCart() {
    // TODO: Associate cart with user later
    return this.cartService.getCart();
  }

  @Patch(':productId') // Handle PATCH /cart/:productId
  async updateItemQuantity(
    @Param('productId') productId: string,
    @Body('quantity', ParseIntPipe) quantity: number, // Use ParseIntPipe for validation
  ) {
    return this.cartService.updateItemQuantity(productId, quantity);
  }

  @Delete(':productId') // Handle DELETE /cart/:productId
  @HttpCode(HttpStatus.OK) // Or 204 No Content if preferred
  async removeItem(@Param('productId') productId: string) {
    return this.cartService.removeItem(productId);
  }
}

```

# backend/api/src/cart/cart.module.ts

```ts
import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
  controllers: [CartController],
  providers: [CartService]
})
export class CartModule {}

```

# backend/api/src/cart/cart.service.ts

```ts
import { Injectable, Logger } from '@nestjs/common';

// Define a simple DTO for the expected payload
export interface AddToCartDto {
  productId: string;
  quantity: number;
}

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);
  // In-memory cart for demonstration (replace with database later)
  private cart: { [productId: string]: number } = {};

  async addItem(addToCartDto: AddToCartDto): Promise<{ success: boolean; message: string; cart: any }> {
    const { productId, quantity } = addToCartDto;
    this.logger.log(`Attempting to add item: ${productId}, Quantity: ${quantity}`);

    if (!productId || quantity == null || quantity < 1) {
      this.logger.warn(`Invalid payload received: ${JSON.stringify(addToCartDto)}`);
      return { success: false, message: 'Invalid product ID or quantity.', cart: this.cart };
    }

    // Basic validation/logic (replace with real checks later)
    // For now, just add/update quantity in the in-memory cart
    this.cart[productId] = (this.cart[productId] || 0) + quantity;

    this.logger.log(`Item added/updated. Current cart: ${JSON.stringify(this.cart)}`);

    // Return a success response (adjust return type as needed by frontend)
    return { success: true, message: 'Item added to cart.', cart: this.cart };
  }

  async getCart(): Promise<{ cart: any }> {
    this.logger.log(`Getting current cart: ${JSON.stringify(this.cart)}`);
    // In a real app, fetch from DB based on user session/ID
    return { cart: this.cart };
  }

  async updateItemQuantity(productId: string, quantity: number): Promise<{ success: boolean; message: string; cart: any }> {
    this.logger.log(`Attempting to update quantity for ${productId} to ${quantity}`);
    if (quantity < 1) {
      this.logger.warn(`Invalid quantity ${quantity}, removing item ${productId}`);
      delete this.cart[productId];
      return { success: true, message: 'Item removed due to quantity zero.', cart: this.cart };
    }
    if (!this.cart[productId]) {
       this.logger.warn(`Item ${productId} not found in cart for update.`);
       return { success: false, message: 'Item not found in cart.', cart: this.cart };
    }
    this.cart[productId] = quantity;
    this.logger.log(`Quantity updated. Current cart: ${JSON.stringify(this.cart)}`);
    return { success: true, message: 'Cart updated.', cart: this.cart };
  }

   async removeItem(productId: string): Promise<{ success: boolean; message: string; cart: any }> {
     this.logger.log(`Attempting to remove item ${productId}`);
     if (!this.cart[productId]) {
       this.logger.warn(`Item ${productId} not found in cart for removal.`);
       return { success: false, message: 'Item not found in cart.', cart: this.cart };
     }
     delete this.cart[productId];
     this.logger.log(`Item removed. Current cart: ${JSON.stringify(this.cart)}`);
     return { success: true, message: 'Item removed from cart.', cart: this.cart };
   }
}

```

# backend/api/src/categories/categories.controller.ts

```ts
import { Controller, Get, Param, NotFoundException, Query } from '@nestjs/common'; // Added Query
import { CategoriesService } from './categories.service';
import { CategoryEntity } from './entities/category.entity'; // Import CategoryEntity instead of Category interface

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('featured')
  async getFeaturedCategories(@Query('storeSlug') storeSlug?: string): Promise<CategoryEntity[]> { // Accept storeSlug query param
    return this.categoriesService.getFeaturedCategories(storeSlug); // Pass storeSlug to service
  }

  @Get(':id') // Handle GET /categories/:id
  async findOne(@Param('id') id: string, @Query('storeSlug') storeSlug?: string): Promise<CategoryEntity> { // Accept storeSlug query param
    const category = await this.categoriesService.findOne(id, storeSlug); // Pass storeSlug to service
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category; // Service now returns CategoryEntity or null, NotFoundException handles null case
  }
}

```

# backend/api/src/categories/categories.module.ts

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Import TypeOrmModule
import { CategoryEntity } from './entities/category.entity'; // Import CategoryEntity
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity])], // Add TypeOrmModule import
  controllers: [CategoriesController],
  providers: [CategoriesService]
})
export class CategoriesModule {}

```

# backend/api/src/categories/categories.service.ts

```ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm'; // Import FindOptionsWhere
import { CategoryEntity } from './entities/category.entity';
// Remove Category interface import if not needed elsewhere in this file
// import { Category } from '@shared-types';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoriesRepository: Repository<CategoryEntity>,
  ) {}

  async getFeaturedCategories(storeSlug?: string): Promise<CategoryEntity[]> { // Add storeSlug parameter
    const where: FindOptionsWhere<CategoryEntity> = {};
    if (storeSlug) {
      where.store = { slug: storeSlug }; // Filter by store slug if provided
    }

    return this.categoriesRepository.find({
      where,
      take: 4,
      order: { name: 'ASC' }, // Example ordering
      relations: ['store'], // Ensure store relation is loaded for filtering
    });
  }

  async findOne(id: string, storeSlug?: string): Promise<CategoryEntity | null> { // Add storeSlug parameter
    const where: FindOptionsWhere<CategoryEntity> = { id };
    if (storeSlug) {
      where.store = { slug: storeSlug }; // Filter by store slug if provided
    }

    // Use findOne with where and relations instead of findOneBy for relation filtering
    const category = await this.categoriesRepository.findOne({
      where,
      relations: ['store'], // Ensure store relation is loaded for filtering
    });
    return category;
  }
}

```

# backend/api/src/categories/entities/category.entity.ts

```ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Category as ICategory } from '@shared-types';
import { StoreEntity } from '../../stores/entities/store.entity';

@Entity('categories')
export class CategoryEntity implements ICategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ unique: true })
  name: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @ManyToOne(() => StoreEntity, (store) => store.categories, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'storeId' })
  store: StoreEntity;

  @Column()
  storeId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

# backend/api/src/main.ts

```ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api'); // Set the global prefix for all routes
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

```

# backend/api/src/migrations/1743589158713-InitialSchema.ts

```ts
import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1743589158713 implements MigrationInterface {
    name = 'InitialSchema1743589158713'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sku" character varying NOT NULL, "name" character varying NOT NULL, "description" text NOT NULL, "price" numeric(10,2) NOT NULL, "imageUrl" character varying, "tags" text, "stockLevel" integer NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c44ac33a05b144dd0d9ddcf9327" UNIQUE ("sku"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_c44ac33a05b144dd0d9ddcf932" ON "products" ("sku") `);
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "imageUrl" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_8b0be371d28245da6e4f4b6187" ON "categories" ("name") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_8b0be371d28245da6e4f4b6187"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c44ac33a05b144dd0d9ddcf932"`);
        await queryRunner.query(`DROP TABLE "products"`);
    }

}

```

# backend/api/src/migrations/1743592892142-AddStoreEntityAndRelations.ts

```ts
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStoreEntityAndRelations1743592892142 implements MigrationInterface {
    name = 'AddStoreEntityAndRelations1743592892142'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "stores" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "slug" character varying NOT NULL, "description" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_a205ca5a37fa5e10005f003aaf3" UNIQUE ("name"), CONSTRAINT "UQ_790b2968701a6ff5ff383237765" UNIQUE ("slug"), CONSTRAINT "PK_7aa6e7d71fa7acdd7ca43d7c9cb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_a205ca5a37fa5e10005f003aaf" ON "stores" ("name") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_790b2968701a6ff5ff38323776" ON "stores" ("slug") `);
        // Step 1a: Insert the default store record first to satisfy FK constraints later
        const defaultStoreId = '11111111-1111-1111-1111-111111111111'; // Use valid UUID from seed.ts
        const defaultStoreName = 'Default Store (Migration)'; // Give it a name
        const defaultStoreSlug = 'default-store-migration'; // Give it a slug
        await queryRunner.query(
            `INSERT INTO "stores" ("id", "name", "slug", "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW()) ON CONFLICT ("id") DO NOTHING`,
            [defaultStoreId, defaultStoreName, defaultStoreSlug]
        );

        // Step 1b: Add columns allowing NULL initially
        await queryRunner.query(`ALTER TABLE "categories" ADD "storeId" uuid NULL`);
        await queryRunner.query(`ALTER TABLE "products" ADD "storeId" uuid NULL`);

        // Step 2: Update existing rows with the default storeId
        await queryRunner.query(`UPDATE "categories" SET "storeId" = $1 WHERE "storeId" IS NULL`, [defaultStoreId]);
        await queryRunner.query(`UPDATE "products" SET "storeId" = $1 WHERE "storeId" IS NULL`, [defaultStoreId]);

        // Step 3: Alter columns to be NOT NULL
        await queryRunner.query(`ALTER TABLE "categories" ALTER COLUMN "storeId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "storeId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_fa6ba3528de12e174b163c09fdd" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_782da5e50e94b763eb63225d69d" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_782da5e50e94b763eb63225d69d"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_fa6ba3528de12e174b163c09fdd"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "storeId"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "storeId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_790b2968701a6ff5ff38323776"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a205ca5a37fa5e10005f003aaf"`);
        await queryRunner.query(`DROP TABLE "stores"`);
    }

}

```

# backend/api/src/migrations/1743601069433-CreateUsersTable.ts

```ts
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1743601069433 implements MigrationInterface {
    name = 'CreateUsersTable1743601069433'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "phone" character varying, "passwordHash" character varying NOT NULL, "roles" text NOT NULL DEFAULT 'customer', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
    }

}

```

# backend/api/src/products/entities/product.entity.ts

```ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne, // Import ManyToOne
  JoinColumn, // Import JoinColumn for explicit foreign key naming
} from 'typeorm';
import { Product as IProduct } from '@shared-types';
import { StoreEntity } from '../../stores/entities/store.entity'; // Import StoreEntity

@Entity('products')
export class ProductEntity implements Omit<IProduct, 'categoryIds'> {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true }) // Add index for SKU
  @Column({ unique: true })
  sku: string;

  @Column()
  name: string;

  @Column('text') // Use 'text' for potentially long descriptions
  description: string;

  @Column('decimal', { precision: 10, scale: 2 }) // Use decimal for currency
  price: number;

  @Column({ nullable: true })
  imageUrl?: string;

  // Categories will likely be a ManyToMany relation later
  // For now, we might omit or store as simple-array if needed temporarily
  // @Column('simple-array', { nullable: true })
  // categoryIds?: string[];

  @Column('simple-array', { nullable: true })
  tags?: string[];

  @Column('int') // Use integer for stock
  stockLevel: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relation: A product belongs to one store
  @ManyToOne(() => StoreEntity, (store) => store.products, {
    nullable: false, // A product must belong to a store
    onDelete: 'CASCADE', // Optional: Delete products if store is deleted
  })
  @JoinColumn({ name: 'storeId' }) // Explicitly define the foreign key column name
  store: StoreEntity;

  @Column() // Add the foreign key column explicitly if needed for queries without relation loading
  storeId: string;

  // Add relations later (e.g., categories, variants, reviews)
}

```

# backend/api/src/products/products.controller.ts

```ts
import { Controller, Get, Param, NotFoundException, Query } from '@nestjs/common'; // Added Query
import { ProductsService, FindAllProductsParams } from './products.service'; // Import FindAllProductsParams type
import { ProductEntity } from './entities/product.entity'; // Import ProductEntity instead of Product interface

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('featured')
  async getFeaturedProducts(@Query('storeSlug') storeSlug?: string): Promise<ProductEntity[]> { // Accept storeSlug query param
    return this.productsService.getFeaturedProducts(storeSlug); // Pass storeSlug to service
  }

  // Handle GET /products with query parameters for filtering, sorting, pagination
  @Get()
  async findAll(@Query() queryParams: FindAllProductsParams): Promise<{ products: ProductEntity[], total: number }> {
    // The storeSlug will be part of queryParams if provided
    return this.productsService.findAll(queryParams);
  }

  @Get(':id') // Handle GET /products/:id
  async findOne(@Param('id') id: string, @Query('storeSlug') storeSlug?: string): Promise<ProductEntity> { // Accept storeSlug query param
    const product = await this.productsService.findOne(id, storeSlug); // Pass storeSlug to service
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product; // Service now returns ProductEntity or null, NotFoundException handles null case
  }
}

```

# backend/api/src/products/products.module.ts

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity])],
  controllers: [ProductsController],
  providers: [ProductsService],
  // Add controllers and providers later
})
export class ProductsModule {}

```

# backend/api/src/products/products.service.ts

```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike, MoreThanOrEqual, LessThanOrEqual, In, FindOptionsOrder, Between } from 'typeorm'; // Added Between
import { Product } from '@shared-types'; // Import the shared interface
import { ProductEntity } from './entities/product.entity';

// Define interface for query parameters used in findAll
export interface FindAllProductsParams {
  category_id?: string;
  sort?: string; // e.g., 'price-asc', 'price-desc', 'newest'
  page?: number;
  limit?: number;
  price_min?: number;
  price_max?: number;
  tags?: string; // Comma-separated string from query params
  q?: string; // For search term
  storeSlug?: string; // Added store slug for filtering
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productsRepository: Repository<ProductEntity>,
  ) {}

  async getFeaturedProducts(storeSlug?: string): Promise<ProductEntity[]> { // Add storeSlug parameter
    // Fetch products tagged as 'Featured'
    // Note: Using array_contains or similar depends on DB. This uses basic find.
    // A better approach might be a dedicated 'isFeatured' flag or relation.
    const where: FindOptionsWhere<ProductEntity> = {
      tags: ILike('%Featured%'),
      isActive: true,
    };

    if (storeSlug) {
      where.store = { slug: storeSlug }; // Filter by store slug if provided
    }

    return this.productsRepository.find({
      where,
      take: 8, // Limit to 8 featured products
      relations: ['store'], // Ensure store relation is loaded for filtering
    });
     // Fallback/Alternative if In(['Featured']) doesn't work: Fetch more and filter in code
     // const candidates = await this.productsRepository.find({ where: { isActive: true }, take: 20 });
     // return candidates.filter(p => p.tags?.includes('Featured')).slice(0, 6);
  }

  async findOne(id: string, storeSlug?: string): Promise<ProductEntity | null> { // Add storeSlug parameter
    const where: FindOptionsWhere<ProductEntity> = {
      id,
      isActive: true,
    };

    if (storeSlug) {
      where.store = { slug: storeSlug }; // Filter by store slug if provided
    }

    // Use findOne with where and relations instead of findOneBy for relation filtering
    const product = await this.productsRepository.findOne({
      where,
      relations: ['store'], // Ensure store relation is loaded for filtering
    });

    return product;
  }

  async findAll(params: FindAllProductsParams): Promise<{ products: ProductEntity[], total: number }> {
    const page = params.page ? +params.page : 1;
    const limit = params.limit ? +params.limit : 12;
    const skip = (page - 1) * limit;

    // Build WHERE conditions
    const where: FindOptionsWhere<ProductEntity> = { isActive: true };

    // Add store filtering
    if (params.storeSlug) {
      where.store = { slug: params.storeSlug };
    }
    if (params.q) {
      // Basic search on name and description
      where.name = ILike(`%${params.q}%`); // Case-insensitive search
      // Add description search if needed, might need OR condition which is more complex
      // where.description = ILike(`%${params.q}%`);
    }
    // Handle price range filtering correctly
    if (params.price_min !== undefined && params.price_max !== undefined) {
      where.price = Between(params.price_min, params.price_max);
    } else if (params.price_min !== undefined) {
      where.price = MoreThanOrEqual(params.price_min);
    } else if (params.price_max !== undefined) {
      where.price = LessThanOrEqual(params.price_max);
    }
    if (params.tags) {
      // Filtering by tags in simple-array might require specific DB functions or fetching then filtering
      // where.tags = In(params.tags.split(',')); // This might not work directly
      // For now, we might have to fetch more and filter in code, or omit tag filtering here
    }
    // !! IMPORTANT: Category filtering needs relations setup in entities !!
    // if (params.category_id) {
    //   where.categories = { id: params.category_id }; // Example if relation 'categories' exists
    // }


    // Build ORDER conditions
    const order: FindOptionsOrder<ProductEntity> = {};
    switch (params.sort) {
      case 'price-asc':
        order.price = 'ASC';
        break;
      case 'price-desc':
        order.price = 'DESC';
        break;
      case 'name-asc':
         order.name = 'ASC';
         break;
      case 'newest': // Assuming 'createdAt' field exists
         order.createdAt = 'DESC';
         break;
      default:
         order.name = 'ASC'; // Default sort
         break;
    }

    const [results, total] = await this.productsRepository.findAndCount({
      where,
      order,
      take: limit,
      skip: skip,
      relations: ['store'], // Load store relation for filtering
      // relations: ['store', 'categories'], // Include categories later if needed
    });

    // TODO: Re-apply tag filtering here if DB query wasn't possible
    // if (params.tags) { ... filter results array ... }

    return { products: results, total };
  }
}

```

# backend/api/src/seed.ts

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CategoryEntity } from './categories/entities/category.entity';
import { ProductEntity } from './products/entities/product.entity';
import { StoreEntity } from './stores/entities/store.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';

// --- Define Seed Data --- 

const storeData = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Awesome Gadgets & Goods', slug: 'awesome-gadgets' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Fashion & Fun Zone', slug: 'fashion-fun' },
];

// Assign categories to stores
const categoryData = [
  // Store 1: Awesome Gadgets & Goods
  { id: 'aaa00001-c246-4913-9166-f75a99ee0c21', name: 'Electronics', description: 'Gadgets and devices', imageUrl: 'https://picsum.photos/seed/aaa00001/300/200', storeId: storeData[0].id },
  { id: 'aaa00003-c246-4913-9166-f75a99ee0c21', name: 'Home Goods', description: 'Items for your home', imageUrl: 'https://picsum.photos/seed/aaa00003/300/200', storeId: storeData[0].id },
  { id: 'aaa00004-c246-4913-9166-f75a99ee0c21', name: 'Books', description: 'Literature and reading materials', imageUrl: 'https://picsum.photos/seed/aaa00004/300/200', storeId: storeData[0].id },
  // Store 2: Fashion & Fun Zone
  { id: 'aaa00002-c246-4913-9166-f75a99ee0c21', name: 'Apparel', description: 'Clothing and fashion', imageUrl: 'https://picsum.photos/seed/aaa00002/300/200', storeId: storeData[1].id },
  { id: 'aaa00005-c246-4913-9166-f75a99ee0c21', name: 'Sports & Outdoors', description: 'Equipment for sports and outdoor activities.', imageUrl: 'https://picsum.photos/seed/aaa00005/300/200', storeId: storeData[1].id },
  { id: 'aaa00006-c246-4913-9166-f75a99ee0c21', name: 'Toys & Games', description: 'Fun for all ages.', imageUrl: 'https://picsum.photos/seed/aaa00006/300/200', storeId: storeData[1].id },
];

// Assign products to stores based on their category
const productData = [
  // Electronics (Store 1)
  { sku: 'ELEC-001', name: 'Wireless Noise-Cancelling Headphones', description: 'Experience immersive sound with these premium headphones.', price: 199.99, imageUrl: 'https://picsum.photos/seed/ELEC-001/500/500', tags: ['New', 'Featured', 'Audio'], stockLevel: 50, isActive: true, storeId: storeData[0].id },
  { sku: 'ELEC-002', name: 'Smartwatch Series 8', description: 'Stay connected and track your fitness goals effortlessly.', price: 349.00, imageUrl: 'https://picsum.photos/seed/ELEC-002/500/500', tags: ['New', 'Featured', 'Wearable'], stockLevel: 25, isActive: true, storeId: storeData[0].id },
  { sku: 'ELEC-003', name: 'Portable Bluetooth Speaker', description: 'Compact speaker with powerful sound quality for music on the go.', price: 49.99, imageUrl: 'https://picsum.photos/seed/ELEC-003/500/500', tags: ['Sale', 'Featured', 'Audio'], stockLevel: 40, isActive: true, storeId: storeData[0].id },
  { sku: 'ELEC-004', name: '4K Ultra HD Smart TV', description: 'Stunning picture quality with smart features.', price: 799.99, imageUrl: 'https://picsum.photos/seed/ELEC-004/500/500', tags: ['Featured', 'Home Entertainment'], stockLevel: 15, isActive: true, storeId: storeData[0].id },
  { sku: 'ELEC-005', name: 'Gaming Laptop', description: 'High-performance laptop for gaming enthusiasts.', price: 1299.00, imageUrl: 'https://picsum.photos/seed/ELEC-005/500/500', tags: ['New', 'Gaming'], stockLevel: 10, isActive: true, storeId: storeData[0].id },

  // Apparel (Store 2)
  { sku: 'APPA-001', name: 'Classic Cotton T-Shirt', description: 'A comfortable and stylish everyday essential, available in multiple colors.', price: 24.99, imageUrl: 'https://picsum.photos/seed/APPA-001/500/500', tags: ['Best Seller', 'Featured', 'Basics'], stockLevel: 120, isActive: true, storeId: storeData[1].id },
  { sku: 'APPA-002', name: 'Slim Fit Denim Jeans', description: 'Classic slim fit denim jeans for a modern look.', price: 59.99, imageUrl: 'https://picsum.photos/seed/APPA-002/500/500', tags: ['Menswear'], stockLevel: 65, isActive: true, storeId: storeData[1].id },
  { sku: 'APPA-003', name: 'Lightweight Hoodie', description: 'Perfect for layering or cool evenings.', price: 45.00, imageUrl: 'https://picsum.photos/seed/APPA-003/500/500', tags: ['New', 'Casual'], stockLevel: 75, isActive: true, storeId: storeData[1].id },
  { sku: 'APPA-004', name: 'Summer Dress', description: 'Flowy and comfortable dress for warm weather.', price: 65.00, imageUrl: 'https://picsum.photos/seed/APPA-004/500/500', tags: ['Womenswear', 'Sale'], stockLevel: 40, isActive: true, storeId: storeData[1].id },
  { sku: 'APPA-005', name: 'Running Sneakers', description: 'Lightweight and supportive sneakers for your runs.', price: 89.99, imageUrl: 'https://picsum.photos/seed/APPA-005/500/500', tags: ['Footwear', 'Sports'], stockLevel: 55, isActive: true, storeId: storeData[1].id },

  // Home Goods (Store 1)
  { sku: 'HOME-001', name: 'Ceramic Coffee Mug Set (4)', description: 'Start your day right with this durable set of mugs.', price: 39.99, imageUrl: 'https://picsum.photos/seed/HOME-001/500/500', tags: ['Kitchen', 'Gift Idea'], stockLevel: 80, isActive: true, storeId: storeData[0].id },
  { sku: 'HOME-002', name: 'Luxury Scented Candle', description: 'Relaxing lavender and vanilla scented candle in a glass jar.', price: 22.50, imageUrl: 'https://picsum.photos/seed/HOME-002/500/500', tags: ['New', 'Home Decor'], stockLevel: 70, isActive: true, storeId: storeData[0].id },
  { sku: 'HOME-003', name: 'Plush Throw Blanket', description: 'Soft and cozy blanket for your sofa or bed.', price: 49.99, imageUrl: 'https://picsum.photos/seed/HOME-003/500/500', tags: ['Comfort', 'Home Decor'], stockLevel: 60, isActive: true, storeId: storeData[0].id },
  { sku: 'HOME-004', name: 'Stainless Steel Cookware Set', description: 'Durable 10-piece cookware set for your kitchen.', price: 149.99, imageUrl: 'https://picsum.photos/seed/HOME-004/500/500', tags: ['Kitchen', 'Featured'], stockLevel: 20, isActive: true, storeId: storeData[0].id },
  { sku: 'HOME-005', name: 'Wall Art Print', description: 'Abstract art print to enhance your living space.', price: 75.00, imageUrl: 'https://picsum.photos/seed/HOME-005/500/500', tags: ['Home Decor'], stockLevel: 35, isActive: true, storeId: storeData[0].id },

  // Books (Store 1)
  { sku: 'BOOK-001', name: 'The Midnight Library', description: 'A captivating novel about choices and regrets.', price: 15.99, imageUrl: 'https://picsum.photos/seed/BOOK-001/500/500', tags: ['Featured', 'Fiction', 'Best Seller'], stockLevel: 30, isActive: true, storeId: storeData[0].id },
  { sku: 'BOOK-002', name: 'Astrophysics for People in a Hurry', description: 'A concise and accessible guide to the cosmos.', price: 12.99, imageUrl: 'https://picsum.photos/seed/BOOK-002/500/500', tags: ['Non-Fiction', 'Science'], stockLevel: 45, isActive: true, storeId: storeData[0].id },
  { sku: 'BOOK-003', name: 'Cookbook: Simple Recipes', description: 'Easy and delicious recipes for everyday cooking.', price: 25.00, imageUrl: 'https://picsum.photos/seed/BOOK-003/500/500', tags: ['Cooking', 'Gift Idea'], stockLevel: 50, isActive: true, storeId: storeData[0].id },
  { sku: 'BOOK-004', name: 'Children\'s Picture Book', description: 'A beautifully illustrated story for young readers.', price: 9.99, imageUrl: 'https://picsum.photos/seed/BOOK-004/500/500', tags: ['Children', 'Illustrated'], stockLevel: 100, isActive: true, storeId: storeData[0].id },

  // Sports & Outdoors (Store 2)
  { sku: 'SPRT-001', name: 'Premium Yoga Mat', description: 'Extra thick, comfortable, and non-slip yoga mat.', price: 34.99, imageUrl: 'https://picsum.photos/seed/SPRT-001/500/500', tags: ['Best Seller', 'Featured', 'Fitness'], stockLevel: 90, isActive: true, storeId: storeData[1].id },
  { sku: 'SPRT-002', name: 'Hiking Backpack (40L)', description: 'Durable and spacious backpack for day hikes or travel.', price: 79.99, imageUrl: 'https://picsum.photos/seed/SPRT-002/500/500', tags: ['Hiking', 'Travel', 'New'], stockLevel: 40, isActive: true, storeId: storeData[1].id },
  { sku: 'SPRT-003', name: 'Resistance Band Set', description: 'Versatile resistance bands for home workouts.', price: 19.99, imageUrl: 'https://picsum.photos/seed/SPRT-003/500/500', tags: ['Fitness', 'Workout'], stockLevel: 110, isActive: true, storeId: storeData[1].id },
  { sku: 'SPRT-004', name: 'Insulated Water Bottle', description: 'Keeps drinks cold for 24 hours or hot for 12.', price: 24.99, imageUrl: 'https://picsum.photos/seed/SPRT-004/500/500', tags: ['Hydration', 'Outdoor'], stockLevel: 150, isActive: true, storeId: storeData[1].id },

  // Toys & Games (Store 2)
  { sku: 'TOY-001', name: 'Wooden Building Blocks Set (100pcs)', description: 'Classic wooden building blocks for creative and educational play.', price: 45.99, imageUrl: 'https://picsum.photos/seed/TOY-001/500/500', tags: ['Educational', 'Kids'], stockLevel: 150, isActive: true, storeId: storeData[1].id },
  { sku: 'TOY-002', name: 'Strategy Board Game', description: 'Engaging board game for family game night.', price: 39.99, imageUrl: 'https://picsum.photos/seed/TOY-002/500/500', tags: ['Family Fun', 'Strategy'], stockLevel: 60, isActive: true, storeId: storeData[1].id },
  { sku: 'TOY-003', name: 'Plush Teddy Bear', description: 'Soft and cuddly teddy bear companion.', price: 19.99, imageUrl: 'https://picsum.photos/seed/TOY-003/500/500', tags: ['Gift Idea', 'Kids'], stockLevel: 95, isActive: true, storeId: storeData[1].id },
  { sku: 'TOY-004', name: 'Remote Control Car', description: 'Fast and fun remote control car for indoor/outdoor play.', price: 29.99, imageUrl: 'https://picsum.photos/seed/TOY-004/500/500', tags: ['Outdoor', 'Kids', 'Sale'], stockLevel: 70, isActive: true, storeId: storeData[1].id },
];


async function bootstrap() {
  const logger = new Logger('Seed');
  logger.log('Starting database seeding process...');

  // Create a standalone application context
  const appContext = await NestFactory.createApplicationContext(AppModule);

  // Get repository instances
  const storeRepository = appContext.get<Repository<StoreEntity>>(getRepositoryToken(StoreEntity));
  const categoryRepository = appContext.get<Repository<CategoryEntity>>(getRepositoryToken(CategoryEntity));
  const productRepository = appContext.get<Repository<ProductEntity>>(getRepositoryToken(ProductEntity));

  try {
    // --- Seed Stores ---
    logger.log('Seeding stores...');
    const storeUpsertResult = await storeRepository.upsert(storeData, ['id']); // Upsert based on ID
    logger.log(`Stores seeded/updated: ${storeUpsertResult.raw?.length || storeUpsertResult.generatedMaps?.length || 'N/A (check upsert result)'}`);
    const storeCount = await storeRepository.count();
    logger.log(`Total stores in DB after seeding: ${storeCount}`);

    // --- Seed Categories ---
    logger.log('Seeding categories...');
    const categoryUpsertResult = await categoryRepository.upsert(categoryData, ['id']); // Upsert based on ID
    logger.log(`Categories seeded/updated: ${categoryUpsertResult.raw?.length || categoryUpsertResult.generatedMaps?.length || 'N/A (check upsert result)'}`);
    const categoryCount = await categoryRepository.count();
    logger.log(`Total categories in DB after seeding: ${categoryCount}`);


    // --- Seed Products ---
    logger.log('Seeding products...');
    await productRepository.upsert(productData, ['sku']); // Upsert based on SKU
    const productCount = await productRepository.count(); // Count products after upsert
    logger.log(`Total products in DB after seeding: ${productCount}`);


    logger.log('Database seeding completed successfully.');
  } catch (error) {
    logger.error('Error during database seeding:', error);
  } finally {
    // Close the application context
    await appContext.close();
    logger.log('Application context closed.');
  }
}

bootstrap();
```

# backend/api/src/stores/entities/store.entity.ts

```ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { ProductEntity } from '../../products/entities/product.entity';
import { CategoryEntity } from '../../categories/entities/category.entity';

// Define an interface for Store if needed in shared-types later
// import { Store as IStore } from '@shared-types';

@Entity('stores')
export class StoreEntity /* implements IStore */ {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ unique: true })
  name: string;

  @Index({ unique: true }) // Index for efficient lookup by slug
  @Column({ unique: true })
  slug: string; // Used for URL identification (e.g., my-cool-store)

  @Column('text', { nullable: true })
  description?: string;

  // Relation: A store can have many products
  @OneToMany(() => ProductEntity, (product) => product.store)
  products: ProductEntity[];

  // Relation: A store can have many categories
  @OneToMany(() => CategoryEntity, (category) => category.store)
  categories: CategoryEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

# backend/api/src/stores/stores.module.ts

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreEntity } from './entities/store.entity';
// Import controllers and services if/when they are created
// import { StoresController } from './stores.controller';
// import { StoresService } from './stores.service';

@Module({
  imports: [TypeOrmModule.forFeature([StoreEntity])], // Register StoreEntity
  // controllers: [StoresController], // Add controller later if needed
  // providers: [StoresService], // Add service later if needed
  exports: [TypeOrmModule], // Export TypeOrmModule if other modules need StoreRepository
})
export class StoresModule {}
```

# backend/api/src/users/dto/create-user.dto.ts

```ts
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsOptional,
  Matches, // Re-add Matches for phone validation
  // IsPhoneNumber, // Remove IsPhoneNumber
  IsBoolean, // Import IsBoolean
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'First name should not be empty' })
  @IsString()
  @MaxLength(50)
  firstName: string;

  @IsNotEmpty({ message: 'Last name should not be empty' })
  @IsString()
  @MaxLength(50)
  lastName: string;

  @IsNotEmpty({ message: 'Email should not be empty' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(100)
  email: string;

  @IsNotEmpty({ message: 'Password should not be empty' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(100, { message: 'Password cannot be longer than 100 characters' })
  // Removed pattern validation decorator
  password: string;

  @IsOptional()
  // Replace IsPhoneNumber with a regex for Israeli numbers (05X-XXXXXXX or 0X-XXXXXXX)
  @Matches(/^0\d{1,2}-?\d{7}$/, { message: 'Please provide a valid Israeli phone number (e.g., 05X-XXXXXXX or 0X-XXXXXXX)' })
  @MaxLength(20) // Keep max length just in case
  phone?: string;

  @IsOptional()
  @IsBoolean()
  newsletterOptIn?: boolean;

  @IsOptional() // Terms are validated on frontend (requiredTrue), but allow backend to receive it
  @IsBoolean()
  terms?: boolean; // Add terms field
}
```

# backend/api/src/users/entities/user.entity.ts

```ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User as IUser, Address } from '@shared-types'; // Import shared interface

@Entity('users') // Define table name
export class UserEntity implements Omit<IUser, 'addresses' | 'roles'> {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone?: string;

  @Column()
  passwordHash: string; // Store the hashed password

  // Roles might be handled via a separate entity and relation later
  @Column('simple-array', { default: 'customer' })
  roles: ('customer' | 'manager' | 'admin')[];

  // Addresses might be handled via a separate entity and relation later
  // For now, maybe store default shipping/billing as JSON or separate columns if simple
  // @Column('jsonb', { nullable: true })
  // defaultShippingAddress?: Address;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Add relations later (e.g., orders, wishlist)
}

```

# backend/api/src/users/users.module.ts

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [UsersService],
  exports: [UsersService] // Export UsersService so other modules can use it
})
export class UsersModule {}

```

# backend/api/src/users/users.service.ts

```ts
import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto'; // We'll create this DTO

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<UserEntity, 'passwordHash'>> {
    const { email, password, firstName, lastName, phone } = createUserDto;

    // Check if user already exists
    const existingUser = await this.usersRepository.findOneBy({ email });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const saltRounds = 10; // Or configure via ConfigService
    let passwordHash: string;
    try {
      passwordHash = await bcrypt.hash(password, saltRounds);
    } catch (error) {
      throw new InternalServerErrorException('Error hashing password');
    }

    // Create new user entity
    const newUser = this.usersRepository.create({
      email,
      passwordHash,
      firstName,
      lastName,
      phone,
      // Default role is 'customer' as per entity definition
    });

    // Save user
    try {
      const savedUser = await this.usersRepository.save(newUser);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash: _, ...result } = savedUser; // Exclude password hash from result
      return result;
    } catch (error) {
      // Handle potential database errors (e.g., unique constraint violation if check failed)
      throw new InternalServerErrorException('Error saving user to database');
    }
  }

  // Add findOneByEmail method for authentication later
  async findOneByEmail(email: string): Promise<UserEntity | null> {
     return this.usersRepository.findOneBy({ email });
  }

  // Add findOneById method if needed
   async findOneById(id: string): Promise<UserEntity | null> {
     return this.usersRepository.findOneBy({ id });
   }
}

```

# backend/api/test/app.e2e-spec.ts

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});

```

# backend/api/test/jest-e2e.json

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}

```

# backend/api/tsconfig.build.json

```json
{
  "extends": "./tsconfig.json",
  "include": ["src/**/*", "data-source.ts"], // Include src and data-source.ts
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]
}

```

# backend/api/tsconfig.json

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2023",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "paths": {
      "@shared-types": [
        "../../dist/shared-types" // Point to the built library in dist
      ]
    },
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "noFallthroughCasesInSwitch": false
  }
}

```

# docker-compose.dev.yml

```yml
services:
  # PostgreSQL Database Service
  db:
    image: postgres:15 # Use a specific PostgreSQL version
    container_name: magic_store_db
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-magic_store}
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-password}
    ports:
      - "5432:5432" # Map host port 5432 to container port 5432
    volumes:
      - postgres_data:/var/lib/postgresql/data # Persist data using a named volume
    restart: unless-stopped

  # Backend API Service (NestJS)
  api:
    image: node:20-slim # Use a Node.js base image
    container_name: magic_store_api
    working_dir: /usr/src/app
    volumes:
      - .:/usr/src/app # Mount entire project root
      - api_node_modules:/usr/src/app/node_modules # Use a named volume for node_modules
    ports:
      - "3000:3000" # Map host port 3000 to container port 3000
    environment:
      NODE_ENV: development
      POSTGRES_HOST: db # Service name defined above
      POSTGRES_PORT: 5432
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-password}
      POSTGRES_DB: ${POSTGRES_DB:-magic_store}
    # Command to install dependencies (if needed) and start in dev mode
    # Note: The working_dir is now the root, adjust npm commands if needed
    # Assuming backend/api/package.json exists for the start:dev script
    command: sh -c "cd backend/api && npm install && npm run start:dev"
    depends_on:
      - db # Ensure db starts before api
    restart: unless-stopped

  # Frontend Service (Angular)
  frontend:
    image: node:20-slim # Use a Node.js base image
    container_name: magic_store_frontend
    working_dir: /usr/src/app
    volumes:
      - .:/usr/src/app # Mount entire project root
      - frontend_node_modules:/usr/src/app/node_modules # Use a named volume for node_modules
      - angular_cache:/usr/src/app/.angular # Cache Angular build artifacts
    ports:
      - "4200:4200" # Map host port 4200 to container port 4200
    # Command to install dependencies (if needed) and start Angular dev server
    # --host 0.0.0.0 makes it accessible outside the container
    # --poll=1000 helps with file change detection in some environments
    command: sh -c "npm install && npx ng serve storefront --host 0.0.0.0 --poll=1000"
    depends_on:
      - api # Optional: ensure api starts before frontend (useful if frontend calls api on startup)
    restart: unless-stopped

# Named Volumes Definition
volumes:
  postgres_data:
  api_node_modules:
  frontend_node_modules:
  angular_cache:

```

# docker-compose.yml

```yml
services:
  # PostgreSQL Database Service
  db:
    image: postgres:15
    container_name: magic_store_db_prod
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-magic_store_prod} # Consider using different DB name for prod
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD} # Use environment variable for password in prod
    volumes:
      - postgres_data_prod:/var/lib/postgresql/data # Use a separate volume for prod data
    restart: unless-stopped
    networks:
      - internal_network

  # Backend API Service (NestJS)
  api:
    container_name: magic_store_api_prod
    build:
      context: . # Context is the monorepo root
      dockerfile: backend/api/Dockerfile.prod # Path to Dockerfile relative to context
    environment:
      NODE_ENV: production
      PORT: 3000 # NestJS listens on this port internally
      POSTGRES_HOST: db
      POSTGRES_PORT: 5432
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD} # Use environment variable
      POSTGRES_DB: ${POSTGRES_DB:-magic_store_prod}
      # Add other production environment variables (JWT_SECRET, etc.) here
      JWT_SECRET: ${JWT_SECRET} # Pass JWT_SECRET from .env file
    depends_on:
      - db
    restart: unless-stopped
    networks:
      - internal_network
      - web_network # Connect to the network Nginx is on

  # Frontend Service (Nginx serving Angular build)
  frontend:
    container_name: magic_store_frontend_prod
    build:
      context: . # Build context is the monorepo root
      dockerfile: projects/storefront/Dockerfile.prod # We will create this Dockerfile
    ports:
      - "80:80" # Expose Nginx port 80 to the host
    volumes:
      # Mount the custom Nginx configuration
      - ./docker/nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - api # Ensure API is ready before frontend tries to proxy to it
    restart: unless-stopped
    networks:
      - web_network # Connect to the network Nginx is on

# Define Networks
networks:
  internal_network: # For communication between api and db
    driver: bridge
  web_network:      # For communication between frontend (Nginx) and api, and external access
    driver: bridge

# Named Volumes Definition
volumes:
  postgres_data_prod: # Separate volume for production database
```

# docker/nginx/nginx.conf

```conf
server {
    listen 80;
    server_name localhost; # Or your actual domain if needed inside the container

    # Root directory for static files (Angular build output)
    root /usr/share/nginx/html;
    index index.html index.htm;

    # Serve static files directly
    location / {
        # Try to serve file directly, fallback to index.html for Angular routing
        try_files $uri $uri/ /index.html;
    }

    # Reverse proxy for API requests
    location /api/ {
        # Use Docker's internal DNS resolver
        resolver 127.0.0.11 valid=10s;
        set $upstream_api api; # Use a variable to allow resolver
        proxy_pass http://$upstream_api:3000; # Forward to the 'api' service on port 3000 (NO TRAILING SLASH)
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Optional: Increase timeouts if needed
        # proxy_connect_timeout       600;
        # proxy_send_timeout          600;
        # proxy_read_timeout          600;
        # send_timeout                600;
    }

    # Optional: Add error pages if needed
    # error_page 500 502 503 504 /50x.html;
    # location = /50x.html {
    #     root /usr/share/nginx/html;
    # }
}
```

# Dockerfile

```
# ---- Builder Stage ----
# Use a specific Node.js LTS version for reproducibility
FROM node:20-slim AS builder

WORKDIR /app

# Install necessary build tools (if any native modules require them)
# Keep this minimal, only add if 'npm ci' fails without them.
# RUN apt-get update && apt-get install -y --no-install-recommends build-essential python3 && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json package-lock.json* ./

# Install ALL dependencies (including devDependencies needed for build)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Set PATH to include local node_modules binaries
ENV PATH /app/node_modules/.bin:$PATH

# Build backend API
WORKDIR /app/backend/api
RUN nest build

# Build frontend storefront
WORKDIR /app
# Assuming the output path is dist/storefront based on angular.json defaults
RUN ng build storefront --configuration=production


# ---- Production Stage ----
FROM node:20-slim AS production

WORKDIR /app

# Create a non-root user and group
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy built backend application from builder stage
COPY --from=builder /app/backend/api/dist ./backend/api/dist
# Copy backend package files to install production dependencies
COPY --from=builder /app/backend/api/package.json ./backend/api/package.json
# If the backend has its own lock file, copy that too
# COPY --from=builder /app/backend/api/package-lock.json ./backend/api/package-lock.json

# Copy built frontend application from builder stage
# Angular typically builds to dist/<project-name> relative to workspace root
COPY --from=builder /app/dist/storefront ./dist/storefront

# Install backend production dependencies
WORKDIR /app/backend/api
# Use --omit=dev for production dependencies only
RUN npm ci --omit=dev

# Switch back to the app root for consistency if needed, or stay in backend/api
WORKDIR /app

# Change ownership of the app directory to the non-root user
# Ensure all necessary files are owned correctly before switching user
RUN chown -R nestjs:nodejs /app

# Switch to the non-root user
USER nestjs

# Expose the port the backend runs on (default for NestJS is 3000)
EXPOSE 3000

# Command to run the backend application
CMD ["node", "backend/api/dist/main.js"]

```

# Dockerfile.build

```build
# ---- Builder Stage ----
# Use a specific Node.js LTS version for reproducibility
FROM node:20-slim AS builder

WORKDIR /app

# Install necessary build tools (if any native modules require them)
# Keep this minimal, only add if 'npm ci' fails without them.
# RUN apt-get update && apt-get install -y --no-install-recommends build-essential python3 && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json package-lock.json* ./

# Install ALL dependencies (including devDependencies needed for build)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Set PATH to include local node_modules binaries
ENV PATH /app/node_modules/.bin:$PATH

# Build backend API
WORKDIR /app/backend/api
RUN nest build

# Build frontend storefront
WORKDIR /app
# Assuming the output path is dist/storefront based on angular.json defaults
RUN ng build storefront --configuration=production


# ---- Production Stage ----
FROM node:20-slim AS production

WORKDIR /app

# Create a non-root user and group
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy built backend application from builder stage
COPY --from=builder /app/backend/api/dist ./backend/api/dist
# Copy backend package files to install production dependencies
COPY --from=builder /app/backend/api/package.json ./backend/api/package.json
# If the backend has its own lock file, copy that too
# COPY --from=builder /app/backend/api/package-lock.json ./backend/api/package-lock.json

# Copy built frontend application from builder stage
# Angular typically builds to dist/<project-name> relative to workspace root
COPY --from=builder /app/dist/storefront ./dist/storefront

# Install backend production dependencies
WORKDIR /app/backend/api
# Use --omit=dev for production dependencies only
RUN npm ci --omit=dev

# Switch back to the app root for consistency if needed, or stay in backend/api
WORKDIR /app

# Change ownership of the app directory to the non-root user
# Ensure all necessary files are owned correctly before switching user
RUN chown -R nestjs:nodejs /app

# Switch to the non-root user
USER nestjs

# Expose the port the backend runs on (default for NestJS is 3000)
EXPOSE 3000

# Command to run the backend application
CMD ["node", "backend/api/dist/main.js"]

```

# memory-bank/activeContext.md

```md
# Active Context: Online Business Promotion System (Store-Specific Data & Routing)

## 1. Current Focus

*   **Store-Specific Functionality:** Implementing the backend and frontend changes required to make the storefront application display data specific to a store identified by a URL slug (e.g., `/store-slug/home`).
*   **API Filtering:** Ensuring backend API endpoints correctly filter data (products, categories) based on the provided store context.
*   **Frontend Context:** Making the current store context available throughout the Angular application.
*   **Memory Bank Maintenance:** Updating documentation to reflect the new store architecture.

## 2. Recent Changes & Debugging
*   **(Previous Session) Production Deployment & Debugging:** Successfully configured Docker Compose, Dockerfiles, Nginx, database migrations, and seeding for the production environment. Resolved various build and runtime errors. Fixed featured products query.
*   **Store Entity & Relationships (Backend):**
    *   Created `StoreEntity` with `id`, `name`, `slug`, etc. (`backend/api/src/stores/entities/store.entity.ts`).
    *   Added `ManyToOne` relationship from `ProductEntity` and `CategoryEntity` to `StoreEntity`.
    *   Added corresponding `OneToMany` relationships in `StoreEntity`.
    *   Created `StoresModule` (`backend/api/src/stores/stores.module.ts`) and registered `StoreEntity` using `TypeOrmModule.forFeature`.
    *   Imported `StoresModule` into `AppModule` to enable entity auto-loading.
    *   Updated `data-source.ts` (for CLI) to include `StoreEntity`.
*   **Database Migration & Seeding (Store Implementation):**
    *   Troubleshot migration generation issues related to npm script argument passing, TypeORM entity metadata discovery (`StoreEntity` missing from `DataSource` and `AppModule`), and build configuration (`tsconfig.build.json` excluding `data-source.ts`).
    *   Corrected `CMD` path in `backend/api/Dockerfile.prod`.
    *   Generated `AddStoreEntityAndRelations` migration.
    *   Troubleshot migration run failures due to `NOT NULL` constraint on existing data and foreign key violations.
    *   Modified migration script (`1743592892142-AddStoreEntityAndRelations.ts`) to:
        *   Add `storeId` columns as nullable.
        *   Insert a default store record.
        *   Update existing rows to use the default store ID.
        *   Alter columns to `NOT NULL`.
        *   Add foreign key constraints.
    *   Troubleshot file permission errors preventing migration script updates.
    *   Successfully ran the corrected migration.
    *   Updated `seed.ts` to use valid UUIDs for stores and associate products/categories with specific stores.
    *   Successfully ran the updated seed script.
*   **API Filtering (Backend):**
    *   Updated `ProductsService` (`findAll`, `findOne`, `getFeaturedProducts`) to accept optional `storeSlug` and filter queries using `where.store = { slug: storeSlug }`. Added `store` to relations loaded.
    *   Updated `ProductsController` to accept optional `storeSlug` query parameter and pass it to the service.
    *   Updated `CategoriesService` (`findOne`, `getFeaturedCategories`) similarly.
    *   Updated `CategoriesController` similarly.
*   **Store Context & Routing (Frontend):**
    *   Modified `app.routes.ts` to wrap main application routes under a `/:storeSlug` parent route parameter. Added a temporary redirect from root to a default store slug.
    *   Created `StoreContextService` (`projects/storefront/src/app/core/services/store-context.service.ts`) to extract `storeSlug` from the route and provide it as an observable (`currentStoreSlug$`).
    *   Updated `ApiService` (`projects/storefront/src/app/core/services/api.service.ts`) to inject `StoreContextService` and add the `storeSlug` as a query parameter to relevant API calls (getProducts, getProductDetails, getFeaturedProducts, etc.).
*   **Configuration Verification:**
    *   Verified `docker/nginx/nginx.conf` correctly handles Angular routing with the new path structure using `try_files`.
*   **Frontend Link Fixes:**
    *   Updated `HomepageComponent`, `HeaderComponent`, `NavigationComponent`, `FooterComponent`, `CategoryPageComponent` to inject `StoreContextService` and expose `currentStoreSlug$`.
    *   Updated `ProductCardComponent` and `CategoryCardComponent` to accept `storeSlug` as an `@Input`.
    *   Updated `routerLink` directives in all affected component templates (`homepage`, `header`, `navigation`, `footer`, `product-card`, `category-card`, `category-page`) to correctly prepend the `storeSlug` for navigation.
    *   Fixed issue where product/category card content disappeared by adjusting `*ngIf` and using conditional `routerLink` binding.
*   **Login Functionality Debugging (Frontend):**
    *   Identified issue where `AuthGuard` redirected to global `/login`, losing `storeSlug` context.
    *   Moved `/login` and `/register` routes inside the `/:storeSlug` parent route in `app.routes.ts`.
    *   Updated `AuthGuard` to extract `storeSlug` from the target URL (`state.url`) and redirect to the store-specific login path (e.g., `/:storeSlug/login`).
    *   Verified the login flow now correctly handles redirection and maintains store context.
*   **Account Section Routing Debugging (Frontend):**
    *   Identified issue where navigating within the account section caused duplicated URL segments (e.g., `/account/account/orders`).
    *   Traced issue to absolute path redirection (`/account`, `/login`) in `AuthService` after login/logout.
    *   Updated `AuthService` to inject `ActivatedRoute` and construct store-specific relative paths (e.g., `['/', storeSlug, 'account']`) for navigation after login and logout.
    *   Verified navigation within the account section now works correctly.

## 3. Next Steps (Immediate & Planned)

1.  **Commit Changes:** Commit all backend and frontend changes related to store implementation, login fixes, and account routing fixes.
2.  **Fix JWT Configuration:** Resolved the `expiresIn` error during login by adding `JWT_EXPIRATION_TIME` to `.env`, ensuring `ConfigModule` was global, adding logging/defaults to `AuthModule`, and restarting the container. Verified working.
3.  **Refactor Cart to Use Database:** Backend (Entities, Migration, Service Update). Consider if cart needs to be store-specific.
4.  **Implement Basic Account Page:** Backend (`/account/profile` exists), Frontend (`AccountPageComponent` data display, `JwtAuthGuard` applied). Needs UI implementation to show profile data.
5.  **Frontend UI Integration:** Update relevant frontend components (e.g., Homepage, Category Page, Product Page) to use the `storeSlug` from `StoreContextService` when displaying data or making API calls via `ApiService`. (Currently, `ApiService` handles adding the slug, but components might need awareness for other logic).

## 4. Active Decisions & Considerations

*   **Store Identification:** Using a URL slug (`/:storeSlug`) to identify the active store in the frontend.
*   **Backend Filtering:** API endpoints use the `storeSlug` passed as a query parameter (`?storeSlug=...`) to filter database results via TypeORM relations (`where: { store: { slug: storeSlug } }`).
*   **Frontend Context:** Using a dedicated Angular service (`StoreContextService`) to read the `storeSlug` from the route parameters and provide it as an observable. `ApiService` subscribes to this observable to add the slug to API requests.
*   **Frontend Routing Structure:** Routes requiring store context (including auth pages like login/register) must be nested under the `/:storeSlug` parameter to ensure context is available and preserved during navigation/redirection. Guards redirecting to auth pages must construct the store-specific path. Service-based navigation (like in `AuthService`) must also construct store-specific paths, potentially by accessing route parameters.
*   **Migration Strategy:** When adding non-nullable foreign keys (`storeId`) to tables with existing data, the migration must first add the column as nullable, update existing rows with a default value (potentially inserting the default referenced entity first), and then alter the column to be non-nullable.
*   **Production Environment:** (As before) Using Docker Compose with separate production Dockerfiles and Nginx reverse proxy. Environment variables managed via `.env` file on the server.
*   **Image Placeholders:** (As before) Using `picsum.photos`.
*   **Docker Caching:** (As before) Optimized Dockerfiles.
*   **TypeORM CLI:** (As before) Using `process.env` in `data-source.ts` and running commands via `docker exec`.

## 5. Learnings & Insights

*   **TypeORM Entity Loading:** `autoLoadEntities: true` in `TypeOrmModule.forRootAsync` requires entities to be registered via `TypeOrmModule.forFeature` in an imported module (e.g., `StoresModule`). Simply having the entity file is not enough for runtime discovery.
*   **TypeORM CLI vs. Runtime:** The `DataSource` configuration for the CLI (`data-source.ts`) must explicitly list all entities, whereas the runtime configuration can use `autoLoadEntities`.
*   **TypeScript Build Includes:** `tsconfig.build.json`'s `include` property dictates which files are compiled. Files outside the included paths (like `data-source.ts` at the root) need to be explicitly added if required in the build output.
*   **Docker Build Cache:** The build cache can prevent changes (like adding/modifying migration files or updating `tsconfig.build.json`) from being reflected in the image unless `--no-cache` is used or relevant `COPY` layers are invalidated.
*   **Docker `CMD` Path:** The path in the `CMD` instruction must exactly match the location of the compiled entry point file (`main.js`) within the final image stage.
*   **Docker Volumes vs. Build:** Volume mounts in `docker-compose.yml` can overwrite code built into the image at runtime, which can hide build issues or prevent code updates from taking effect without container recreation. (Verified no problematic volumes for `api` service in `docker-compose.yml`).
*   **Migration Constraints:** Adding `NOT NULL` columns or foreign key constraints to tables with existing data requires careful handling (add nullable, update data, alter to not null, add constraint) to avoid errors. Inserting required related data (like a default store) within the migration itself can resolve FK violations.
*   **UUID Format:** Ensure strings used for UUIDs adhere to the standard format when inserting or comparing in the database.
*   **Angular Route Structure:** The placement of routes (inside or outside parameterized parent routes) significantly impacts context availability and how guards should handle redirection.
*   **(Previous Learnings Still Valid):** Docker build context, `npm install` caching, `--ignore-scripts` issues, TypeORM CLI env vars, Nginx resolver/proxy_pass, Angular budgets, `simple-array` querying, `upsert` results.

*(As of 4/2/2025 - Store-specific implementation complete. Login/Registration functionality implemented and debugged, including DB migration and frontend routing fixes. Account section routing fixed.)*

```

# memory-bank/productContext.md

```md
# Product Context: Online Business Promotion System

## 1. Problem Solved

Many small to medium-sized businesses lack the resources or technical expertise to establish a robust online presence, manage e-commerce operations effectively, and gain visibility in a crowded digital marketplace. This system aims to solve these problems by providing an integrated, easy-to-use platform.

## 2. Core Purpose

*   **Empower Businesses:** Provide individual businesses with their own functional, customizable online storefronts (Storefront Website).
*   **Simplify Management:** Offer a comprehensive backend system (Store Management Website) for businesses to manage products, orders, customers, and settings without needing deep technical knowledge.
*   **Increase Visibility:** Aggregate products from all participating stores into a central marketplace (Global Marketplace Website) to enhance product discovery and drive traffic to individual stores.

## 3. Target Users

*   **Store Customers:** End-users browsing and purchasing products on the individual Storefront Websites.
*   **Store Managers:** Business owners or staff using the Store Management Website to operate their online store.
*   **Marketplace Visitors:** Users browsing the Global Marketplace Website to discover products and stores.
*   **(Implicit) System Administrators:** Personnel managing the overall platform (though their interface isn't detailed in the initial plan).

## 4. Desired User Experience

*   **Storefront:** Intuitive, visually appealing, easy navigation, seamless purchasing flow, secure checkout, mobile-friendly. Users should easily find products, get detailed information, and complete purchases with confidence.
*   **Store Management:** Efficient, clear, comprehensive. Managers should be able to perform all necessary tasks (product updates, order processing, customer management, settings configuration) with minimal friction and have a clear overview of their store's performance.
*   **Global Marketplace:** Engaging discovery platform. Users should find it easy to browse diverse products, filter results effectively, learn about different stores, and seamlessly transition to individual store sites.

## 5. Key Functionality Areas (High-Level)

*   **E-commerce Core (Storefront):** Product display, filtering/sorting, cart management, checkout, order confirmation, user accounts.
*   **Store Operations (Management):** Dashboard analytics, product catalog management, order processing workflow, customer relationship management, store configuration.
*   **Product Aggregation (Marketplace):** Cross-store search, category browsing, store discovery, referral tracking.
*   **Authentication & Security:** Secure login for customers and managers, role-based access control (Management).
*   **Data Synchronization:** Ensuring product, inventory, and order data consistency across relevant platforms.

*(This context is derived from the "PAGE FUNCTIONALITY PLAN" document provided on 3/28/2025.)*

## 6. Development Approach

*   **Vertical Slices:** Implement functionality page-by-page, starting with the UI and minimal mock backend support, then iterating to connect to the real backend. Initial focus is on the Storefront Homepage.

```

# memory-bank/progress.md

```md
# Project Progress: Online Business Promotion System

*(As of 4/2/2025 - Store-specific implementation complete. Login/Registration functionality implemented and debugged (DB migration, frontend routing, JWT config). Account section routing fixed.)*

## I. Project Setup & Foundation

*   [x] Initialize Memory Bank (`projectbrief.md`, `productContext.md`, `systemPatterns.md`, `techContext.md`, `activeContext.md`, `progress.md`)
*   [x] Define Project Structure (Monorepo/Separate Repos, Folder Layout) - Decided on Angular CLI Monorepo
*   [x] Initialize Frontend Workspace/Projects (Angular) - Inside `magic-store-workspace`
    *   [x] Storefront App (`projects/storefront`)
    *   [x] Store Management App (`projects/store-management`)
    *   [x] Global Marketplace App (`projects/global-marketplace`)
*   [x] Initialize Backend Project (TypeScript/Node.js) - Initialized NestJS project `api` in `backend` dir
*   [x] Initialize Shared Library/Folder Structure (`projects/shared-types`)
*   [x] Setup Version Control (Git) - Corrected initial setup, force-pushed clean history to remote. Configured user, credential helper. Untracked node_modules.
*   [x] Configure Linters/Formatters (ESLint, Prettier) - Added root configs
*   [x] Choose and Configure Database - Chose PostgreSQL, added TypeORM config & .env
*   [x] Setup Dev Container & Local Docker Build - Development setup (`docker-compose.dev.yml`) functional.

## II. Storefront Website Development

*   [x] Core Layout & Navigation (Header, Footer, Menu) - Basic structure generated and integrated
*   [x] Homepage Implementation - Frontend complete (Carousel, Featured Sections, Search/Newsletter/Cart integration). Backend endpoints for Search, Newsletter needed. Featured products endpoint fixed.
*   [x] Homepage Styling (Modern & Minimalist Theme) - Applied global styles and styled core/homepage components.
*   [/] Category Page Implementation - Basic structure, data fetching, filtering/sorting/pagination controls, styling implemented. Fetches from DB.
*   [/] Product Page Implementation - Basic structure, data fetching, styling implemented. Fetches from DB.
*   [x] Shopping Cart Implementation - Basic structure, data display, add/update/remove actions implemented (connected to backend in-memory cart API).
*   [ ] Checkout Flow Implementation
*   [ ] Order Confirmation Page
*   [x] Authentication (Login, Registration, Recovery) - Registration page (frontend/backend) functional. Login page (frontend/backend) functional, including JWT handling (secret/expiration config fixed), profile loading, and store-specific routing/guard fixes. Recovery pending.
*   [ ] User Account Pages (Overview, Orders, Addresses, etc.) - Placeholder component/route exists. Requires Login.
*   [/] Contact Page - Placeholder component/route exists.
*   [/] About Page - Placeholder component/route exists.
*   [ ] 404 Page
*   [ ] Responsiveness & Mobile Optimization
*   [x] API Integration - Core API service updated with methods for product details, cart operations, registration. Backend endpoints implemented for these (using DB for products/categories, in-memory for cart). Search/Newsletter endpoints still pending. **Updated to pass store context.**
*   [x] Store-Specific Routing & Context - Implemented URL structure `/:storeSlug/...`, `StoreContextService` created, `ApiService` updated to use context. Fixed `routerLink`s in Header, Footer, Navigation, Product/Category Cards, Category Page, Login Page, Registration Page to use store context. Fixed `AuthService` redirection logic.
## III. Store Management Website Development

*   [ ] Core Layout & Navigation
*   [ ] Login Page
*   [ ] Dashboard Implementation
*   [ ] Product Management (List, Add, Edit, Delete, Variants, Bulk Actions)
*   [ ] Order Management (List, View, Update Status, Fulfillment)
*   [ ] Customer Management (List, View, Edit, Notes)
*   [ ] Settings Pages (General, Shipping, Payments, Taxes, etc.)
*   [ ] User Profile & Security (Password, 2FA)
*   [ ] Role-Based Access Control (RBAC) Implementation
*   [ ] 404 Page
*   [ ] API Integration

## IV. Global Marketplace Website Development

*   [ ] Core Layout & Navigation
*   [ ] Homepage Implementation
*   [ ] Category Page Implementation
*   [ ] Product Preview Page
*   [ ] About Page
*   [ ] Contact Page
*   [ ] 404 Page
*   [ ] Responsiveness & Mobile Optimization
*   [ ] API Integration (Read-only focus, Store referrals)

## V. Backend API Development

*   [x] Initial Setup (NestJS, TypeORM, Config, Modules) - Basic setup complete
*   [x] Define Basic Entities (User, Product, Category, Store) - Entities created and configured with TypeORM. Relationships established.
*   [x] Authentication Endpoints (Storefront Customer, Store Manager) - `/auth/register` and `/auth/login` implemented & functional (JWT config fixed). `/account/profile` (JWT protected) implemented.
*   [x] Storefront API Endpoints (Categories, Products, Cart, Orders, Account, etc.) - Endpoints for Products (featured, list, details), Categories (featured, details), Cart (get, add, update, remove), Auth (register) implemented. Services refactored to use TypeORM (except Cart). **Product/Category endpoints updated to filter by storeSlug.** Search/Newsletter pending.
*   [ ] Store Management API Endpoints (Dashboard, Products, Orders, Customers, Settings, Profile, etc.)
*   [ ] Marketplace API Endpoints (Aggregated Products, Categories, Stores, Search)
*   [x] Database Schema Design & Migrations - Initial entities defined, TypeORM configured, data source file created, migration scripts added/fixed. Initial migration generated and run. **Store entity and relations migration created and run successfully after troubleshooting.** **User entity migration generated and run successfully after troubleshooting CLI/build issues.**
*   [x] Database Seeding (Initial) - Script created, expanded, fixed, and run for categories/products. **Updated to seed stores and associate data. Ran successfully.** Image URLs updated to picsum.photos.
*   [ ] Data Synchronization Logic (Inventory, etc.)
*   [ ] Security Implementation (Validation, Rate Limiting, Permissions)
*   [ ] Testing (Unit, Integration)

## VI. Shared Library Development

*   [x] Define Core Data Models/Interfaces (Product, Order, User, Category, etc.) - Category interface updated (optional imageUrl).
*   [x] Setup Build/Packaging for Shared Library - Built successfully.
*   [/] Define DTOs (Data Transfer Objects) for API communication - CreateUserDto created.
*   [ ] Implement Shared Utility Functions/Classes

## VII. Testing & Deployment

*   [ ] Unit Testing Strategy & Implementation
*   [ ] Integration Testing
*   [ ] End-to-End Testing Strategy
*   [/] Deployment Strategy & Setup (Per environment) - Production Docker setup (Compose, Dockerfiles, Nginx) configured and debugged. Cloudflare DNS/SSL steps outlined.
*   [ ] Performance Testing & Optimization

---

**Legend:**
*   `[ ]` - Not Started
*   `[/]` - In Progress
*   `[x]` - Completed

```

# memory-bank/projectbrief.md

```md
# Project Brief: Online Business Promotion System

## 1. Overview

This project aims to build a comprehensive Online Business Promotion System consisting of three interconnected web applications:

1.  **Storefront Website:** A customer-facing e-commerce site template for individual businesses to showcase and sell their products. Each business using the system will have its own instance of this storefront.
2.  **Store Management Website:** A secure, manager-facing portal for each business to manage their products, inventory, orders, customers, and store settings.
3.  **Global Marketplace Website:** An aggregator platform that displays products from all participating stores, providing broader visibility and cross-store discovery for customers.

## 2. Core Goals

*   Provide businesses with a customizable and functional online store presence.
*   Offer robust tools for store managers to efficiently run their online operations.
*   Create a central marketplace to increase product discoverability and drive traffic to individual stores.
*   Ensure a seamless and integrated experience across all three platforms.
*   Build a scalable and maintainable system using the specified technology stack.

## 3. Scope

The scope includes the design, development, and integration of the three websites as detailed in the "PAGE FUNCTIONALITY PLAN" document. This involves:

*   Frontend development for all user interfaces.
*   Backend development for APIs, data management, and business logic.
*   Database design and implementation.
*   Integration points between the three systems.
*   Authentication and authorization mechanisms.
*   Basic performance optimization and responsiveness.

*(This brief is based on the initial "PAGE FUNCTIONALITY PLAN" document provided on 3/28/2025.)*

```

# memory-bank/storefront-styling-plan.md

```md
# Storefront Styling Plan: Modern & Minimalist

This document outlines the plan for implementing a Modern & Minimalist visual style for the storefront application.

**Phase 1: Foundation - Global Styles**

1.  **Define Core Elements:**
    *   **Color Palette:** Establish a primary accent color (e.g., a shade of blue or green), a secondary color (optional), neutral grays, black, and white.
    *   **Typography:** Select a clean sans-serif font (e.g., Inter, Lato, Roboto). Define base sizes, line heights, and styles for headings (h1-h6) and paragraphs (p).
    *   **Spacing:** Implement a consistent spacing system (e.g., 8px base unit).
    *   **Layout:** Define a `.container` class for content centering and max-width.
    *   **Base Elements:** Apply default styles to `body`, `a`, `button`, form inputs.

2.  **Implement in `styles.scss`:**
    *   Use CSS custom properties (`:root`) for colors, fonts, spacing.
    *   Apply base styles to `html`, `body`.
    *   Define styles for typography, links, buttons.
    *   Create the `.container` utility class.

**Phase 2: Component Styling**

1.  **Core Layout Components:**
    *   **Header (`header.component.scss`):** Style header bar, logo, navigation, search bar integration.
    *   **Footer (`footer.component.scss`):** Style footer layout, links, copyright.
    *   **Search Bar (`search-bar.component.scss`):** Style input and button.

2.  **Homepage Specific Components:**
    *   **Homepage Container (`homepage.component.scss`):** Add padding/margins to sections.
    *   **Carousel (`carousel.component.scss`):** Style container, slides, controls.
    *   **Category Card (`category-card.component.scss`):** Style card background, padding, image, text. Use subtle borders/shadows.
    *   **Product Card (`product-card.component.scss`):** Style layout, image, title, price, action buttons.

**Phase 3: Review & Handover**

1.  **Review:** Check homepage and other key pages for consistency and responsiveness.
2.  **Documentation (Optional):** Create `style-guide.md` documenting design system elements.
3.  **Implementation:** Propose switching to "Code" mode for implementation.

**Visual Plan (Mermaid Diagram):**

\`\`\`mermaid
graph TD
    A[Define Modern & Minimalist Style (Colors, Fonts, Spacing)] --> B(Implement Global Styles in styles.scss);
    B --> C{Style Core Components};
    C --> C1[Header];
    C --> C2[Footer];
    C --> C3[Search Bar];
    C1 & C2 & C3 --> D{Style Homepage Components};
    D --> D1[Homepage Container];
    D --> D2[Carousel];
    D --> D3[Category Card];
    D --> D4[Product Card];
    D1 & D2 & D3 & D4 --> E(Review & Refine);
    E --> F(Optional: Document Style Guide);
    F --> G(Propose Switch to Code Mode for Implementation);
```

# memory-bank/systemPatterns.md

```md
# System Patterns: Online Business Promotion System

## 1. High-Level Architecture

The system comprises three distinct but interconnected web applications, communicating via APIs. The Storefront application is designed to be multi-tenant, serving different stores based on a URL slug.

\`\`\`mermaid
graph TD
    subgraph User Facing
        SF[Storefront Website (Angular)]:::angular
        MP[Global Marketplace Website (Angular)]:::angular
    end

    subgraph Management
        SM[Store Management Website (Angular)]:::angular
    end

    subgraph Backend / API Layer (NestJS / TypeORM)
        API[Core API / Backend Services (/api prefix)]:::nestjs
        DB[(PostgreSQL Database)]:::db
    end

    subgraph Data Model
        Store[Store Entity]:::entity
        Product[Product Entity]:::entity
        Category[Category Entity]:::entity
        User[User Entity]:::entity
        Order[Order Entity]:::entity
        Cart[Cart (DB/Session)]:::entity
    end

    SF -- HTTP Calls (/:storeSlug/*) --> API
    MP -- HTTP Calls --> API
    SM -- HTTP Calls --> API
    API -- Data Access (TypeORM) --> DB

    %% Data Relationships
    Store -- OneToMany --> Product
    Store -- OneToMany --> Category
    Product -- ManyToOne --> Store
    Category -- ManyToOne --> Store
    %% Other relations omitted for brevity

    %% Data Sync/Flow (Conceptual)
    SM -- Manages Data --> API
    API -- Updates --> DB
    DB -- Provides Data --> API
    API -- Serves Data (Filtered by Store) --> SF
    API -- Serves Aggregated Data --> MP

    classDef angular fill:#DD0031,stroke:#333,stroke-width:2px,color:#fff;
    classDef nestjs fill:#E0234E,stroke:#333,stroke-width:2px,color:#fff;
    classDef db fill:#336791,stroke:#333,stroke-width:2px,color:#fff;
    classDef entity fill:#4DB33D,stroke:#333,stroke-width:2px,color:#fff;

\`\`\`

## 2. Key Architectural Decisions

*   **Separation of Concerns:** Three distinct Angular frontend applications (Storefront, Management, Marketplace) cater to different user groups and purposes.
*   **API-Driven:** All frontend applications interact with a central backend via RESTful APIs.
*   **Centralized Backend:** A single backend built with NestJS (TypeScript/Node.js) manages business logic, data persistence (PostgreSQL via TypeORM), and serves all three frontends.
*   **Global API Prefix:** The backend uses a global `/api` prefix for all its routes (`app.setGlobalPrefix('api')` in `main.ts`).
*   **Multi-Tenancy (Storefront):** The Storefront app uses a URL parameter (`/:storeSlug`) to identify the current store context. Backend APIs filter data based on this context (passed as `?storeSlug=...` query parameter).
*   **Data Synchronization:** (As before) Product, order, and customer data managed via the Store Management site needs to be consistently reflected in the Storefront and Marketplace.
*   **Shared Library (`@shared-types`):** Common TypeScript types/interfaces are defined in a dedicated Angular library (`projects/shared-types`). This library is built into `dist/shared-types`, and both frontend and backend applications configure path mapping in their respective `tsconfig.json` files to reference the built output.

## 3. Frontend Architecture (Angular)

*   **Component-Based:** Standard Angular component architecture, favoring standalone components where appropriate.
*   **Services:** Services for API interaction (`ApiService`), state management (`CartService` using `BehaviorSubject`), and shared logic.
*   **Routing:** Angular Router for navigation. Storefront uses a parent route `/:storeSlug` to capture store context.
*   **State Management:** Simple state management via services with `BehaviorSubject` (e.g., `CartService`, `StoreContextService`).
*   **Development Proxy:** Angular CLI development server uses `proxy.conf.json` to forward requests starting with `/api` to the backend service (running at `http://localhost:3000`) without path rewriting.
*   **Production Serving:** Built static files served via Nginx.

## 4. Backend Architecture (NestJS / TypeORM)

*   **Framework:** NestJS (TypeScript/Node.js).
*   **ORM:** TypeORM for database interaction with PostgreSQL.
*   **Database:** PostgreSQL.
*   **Modularity:** Backend structured modularly by domain (e.g., `ProductsModule`, `CategoriesModule`, `StoresModule`, `UsersModule`, `AuthModule`, `CartModule`). Modules are registered in `AppModule`.
*   **Configuration:** Uses `@nestjs/config` for environment variable management (`.env` file) within the running application. `data-source.ts` reads `process.env` directly for CLI compatibility. `tsconfig.build.json` explicitly includes `data-source.ts` for compilation.
*   **Database Schema:** Managed via TypeORM migrations. `synchronize: false` is set in `data-source.ts`. Entities are loaded at runtime via `autoLoadEntities: true` in `AppModule` (requires entities to be registered via `forFeature` in imported modules).
*   **Migrations:** TypeORM CLI used via npm scripts (`migration:generate`, `migration:run`, `migration:revert`) defined in `backend/api/package.json`, referencing the compiled `dist/data-source.js`. Migration files stored in `backend/api/src/migrations`. Migrations generated via `docker exec` need copying to host.
*   **Seeding:** Initial database data populated using a standalone script (`backend/api/src/seed.ts`) run via `npm run seed:prod` (using compiled JS). The script bootstraps the NestJS application context to access TypeORM repositories. Uses `upsert` to handle potential re-runs.

## 5. Authentication

*   **JWT (JSON Web Tokens):** Standard for securing API endpoints and managing user sessions (planned). Requires `JWT_SECRET` environment variable.
*   **Role-Based Access Control (RBAC):** Crucial for the Store Management website (planned).

## 6. Deployment Pattern (Docker Compose - Production)

*   **Files:** Uses `docker-compose.yml`, `backend/api/Dockerfile.prod`, `projects/storefront/Dockerfile.prod`, `docker/nginx/nginx.conf`, and `.env` (on server).
*   **Services:**
    *   `db`: PostgreSQL container using `postgres:15` image. Data persisted in named volume (`postgres_data_prod`). Runs on `internal_network`.
    *   `api`: NestJS backend built using multi-stage `Dockerfile.prod`. Runs compiled JS (`node dist/src/main`). Connects to `db` via `internal_network`. Listens internally on port 3000. Also connected to `web_network`.
    *   `frontend`: Nginx container using `nginx:stable-alpine`. Serves static Angular build output copied from multi-stage `Dockerfile.prod`. Mounts `nginx.conf`. Exposes port 80. Runs on `web_network`.
*   **Networking:**
    *   `internal_network`: For `db` <-> `api` communication.
    *   `web_network`: For `frontend` (Nginx) <-> `api` communication and external access via Nginx.
*   **Nginx Configuration (`nginx.conf`):**
    *   Serves static files from `/usr/share/nginx/html`.
    *   Uses `try_files $uri $uri/ /index.html;` for Angular routing.
    *   Proxies `/api/` location to `http://api:3000` (using `resolver 127.0.0.11;` and variable for Docker DNS resolution, no trailing slash on `proxy_pass`). Handles Angular routes like `/:storeSlug/*` correctly.
*   **Environment Variables:** Managed via `.env` file in the project root on the server (e.g., `POSTGRES_PASSWORD`, `JWT_SECRET`). Referenced in `docker-compose.yml`.
*   **Build Process:** Requires building `shared-types` locally (`npx ng build shared-types`) before running `docker compose build`. Dockerfiles optimized for `npm install` caching.
*   **Database Setup:** Requires running `npm run migration:run` and `npm run seed:prod` via `docker exec` after initial container startup.

## 7. Development Environment Pattern (Docker Compose - Development)

*   **Files:** Uses `docker-compose.dev.yml`.
*   **Services:** `db`, `api` (runs `npm run start:dev`), `frontend` (runs `ng serve storefront`).
*   **Volumes:** Mounts source code (`.:/usr/src/app`) for hot-reloading. Uses named volumes for `node_modules` and DB data.
*   **Networking:** Services communicate via Docker's default network.
*   **Proxy:** Relies on Angular's `proxy.conf.json` for API calls from `ng serve`.

## 8. Development Workflow Pattern

*   **Vertical Slices:** Development proceeds by implementing UI and corresponding backend endpoints for a specific feature/page.
*   **Shared Library:** Build the `@shared-types` library (`ng build shared-types`) before starting/restarting the backend service to ensure it picks up the latest types.

## 9. Frontend Form Pattern (Reactive Forms)

*   **Implementation:** Angular Reactive Forms (`ReactiveFormsModule`, `FormBuilder`, `FormGroup`, `FormControl`) used for complex forms like Registration.
*   **Validation:**
    *   Built-in Angular validators (`Validators.required`, `Validators.email`, `Validators.minLength`, `Validators.maxLength`, etc.).
    *   Custom synchronous validators added to the `FormGroup` options (e.g., `passwordMatchValidator`).
    *   Backend DTO validation (`class-validator`) provides server-side checks.
*   **Error Handling:**
    *   Template displays validation errors using `*ngIf` based on control status (`invalid`, `dirty`, `touched`) and specific error keys (`errors?.['required']`).
    *   Component's `onSubmit` checks `form.invalid` before proceeding.
    *   API call errors (e.g., `409 Conflict` for existing email) are caught, and specific error messages are displayed to the user. `form.setErrors` can be used to mark specific fields as invalid based on API response.
*   **UI Feedback:** Submit button disabled (`[disabled]="isSubmitting"`) during API call. Success/error messages displayed using `*ngIf`.

*(Pattern definition updated as of 4/2/2025 reflecting store-specific implementation)*

```

# memory-bank/techContext.md

```md
# Tech Context: Online Business Promotion System

## 1. Core Technologies

*   **Frontend:** Angular (~v18)
    *   Framework for building the user interfaces of all three websites (Storefront, Store Management, Global Marketplace).
    *   TypeScript as the primary language.
    *   SCSS for styling.
    *   Styling Theme: Modern & Minimalist (See [Storefront Styling Plan](./storefront-styling-plan.md)).
    *   Standalone Components preferred where applicable.
*   **Backend:** NestJS (~v10, Node.js ~v20 runtime)
    *   Framework for building the API layer and business logic.
    *   TypeScript as the primary language.
    *   Modules: `AppModule`, `AuthModule`, `UsersModule`, `ProductsModule`, `CategoriesModule`, `StoresModule`, `CartModule`.
*   **Database:** PostgreSQL (~v15)
    *   Relational database managed via TypeORM.
    *   Entities defined in `src/*/entities/*.entity.ts`.
    *   TypeORM configuration via `TypeOrmModule.forRootAsync` in `AppModule` and `TypeOrmModule.forFeature` in feature modules.
*   **API Style:** RESTful with a global `/api` prefix.
*   **Web Server (Production):** Nginx (`stable-alpine` image)
    *   Serves static Angular build output.
    *   Acts as a reverse proxy for the backend API.
    *   Configuration managed via `docker/nginx/nginx.conf`.

## 2. Development Environment & Tooling

*   **Package Manager:** npm (using workspaces for monorepo).
*   **Version Control:** Git (Monorepo hosted at `https://github.com/hishtadlut/magic-store-monorepo.git`). Credential helper configured.
*   **Code Editor:** VS Code.
*   **Containerization:** Docker and Docker Compose.
    *   **Development:** Uses `docker-compose.dev.yml`. Services: `db`, `api` (`start:dev`), `frontend` (`ng serve`). Mounts source code.
    *   **Production:** Uses `docker-compose.yml`. Services: `db`, `api` (runs compiled JS), `frontend` (Nginx). Uses multi-stage Dockerfiles (`backend/api/Dockerfile.prod`, `projects/storefront/Dockerfile.prod`) optimized for caching. Requires `.env` file on server for secrets.
*   **Linters/Formatters:** ESLint, Prettier (Root configs exist).
*   **Build Tools:** Angular CLI (`ng build`, `ng serve`), NestJS CLI (`nest build`, `nest start`), `tsc` (TypeScript Compiler via NestJS).
*   **Proxy (Development):** Angular CLI Dev Server proxy (`proxy.conf.json`) used to forward `/api` requests to the backend container.

## 3. Key Technical Requirements & Constraints

*   **Shared Code (`@shared-types`):** Common types/interfaces managed in an Angular library (`projects/shared-types`). The library is built (`ng build shared-types`) to `dist/shared-types`. Frontend and backend applications use TypeScript path mapping (`tsconfig.json`) to reference the built output. Production Dockerfiles copy necessary source/config for building or copy pre-built output.
*   **Responsiveness:** All frontend applications must be fully responsive across devices.
*   **Performance:** Adherence to performance goals outlined in the plan (e.g., page load times, API response times). Angular build budgets increased.
*   **Security:** Implementation of security best practices.
    *   Password hashing using `bcrypt` implemented in `UsersService`. Native compilation handled during Docker build.
    *   Basic DTO validation using `class-validator` and `ValidationPipe` implemented for registration.
    *   JWT Authentication requires `JWT_SECRET` environment variable in production.
    *   Authentication/Authorization (JWT, Guards, RBAC) still pending full implementation.
*   **Maintainability:** Code should be well-structured, documented, and testable.

## 4. Integration Points

*   **API:** Primary integration via RESTful endpoints with `/api` prefix.
*   **Third-Party Services:** Potential integrations mentioned (e.g., payment gateways, shipping providers, address validation, email services, social logins, Elasticsearch). API keys and configuration will be managed securely.
*   **Image Placeholders:** Using `picsum.photos` for seed data.

## 5. Progress Tracking

*   Markdown files (`progress.md`, `activeContext.md`, etc.) in `memory-bank` directory.

## 6. Database Management

*   **ORM:** TypeORM used for database interaction.
*   **Data Source:** Configuration for TypeORM CLI defined in `backend/api/data-source.ts` (reads `process.env` directly).
*   **Migrations:**
    *   Managed via TypeORM CLI scripts added to `backend/api/package.json` (`migration:generate`, `migration:run`, `migration:revert`), referencing compiled data source.
    *   Migration files stored in `backend/api/src/migrations`.
    *   Generated via `docker exec ... npm run typeorm -- migration:generate ...` and copied to host.
    *   Run via `docker exec ... npm run migration:run`.
*   **Seeding:**
    *   Initial data seeding handled by `backend/api/src/seed.ts`.
    *   Script uses NestJS application context to access repositories.
    *   Run via `npm run seed:prod` script (using compiled JS) via `docker exec`.
    *   Currently seeds stores, categories, and products, associating products/categories with stores.

*(Context updated as of 4/2/2025 reflecting store-specific implementation)*

```

# package.json

```json
{
  "name": "magic-store-workspace",
  "version": "0.0.0",
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "watch": "ng build --watch --configuration development",
    "test": "ng test",
    "lint": "ng lint"
  },
  "private": true,
  "workspaces": [
    "backend/api",
    "projects/*"
  ],
  "dependencies": {
    "@angular/animations": "^18.2.0",
    "@angular/common": "^18.2.0",
    "@angular/compiler": "^18.2.0",
    "@angular/core": "^18.2.0",
    "@angular/forms": "^18.2.0",
    "@angular/platform-browser": "^18.2.0",
    "@angular/platform-browser-dynamic": "^18.2.0",
    "@angular/router": "^18.2.0",
    "rxjs": "~7.8.0",
    "tslib": "^2.3.0",
    "zone.js": "~0.14.10"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^18.2.16",
    "@angular-eslint/builder": "19.3.0",
    "@angular-eslint/eslint-plugin": "19.3.0",
    "@angular-eslint/eslint-plugin-template": "19.3.0",
    "@angular-eslint/schematics": "19.3.0",
    "@angular-eslint/template-parser": "19.3.0",
    "@angular/cli": "^18.2.11",
    "@angular/compiler-cli": "^18.2.0",
    "@types/jasmine": "~5.1.0",
    "@typescript-eslint/eslint-plugin": "7.11.0",
    "@typescript-eslint/parser": "7.11.0",
    "eslint": "8.57.0",
    "jasmine-core": "~5.2.0",
    "karma": "~6.4.0",
    "karma-chrome-launcher": "~3.2.0",
    "karma-coverage": "~2.2.0",
    "karma-jasmine": "~5.1.0",
    "karma-jasmine-html-reporter": "~2.1.0",
    "ng-packagr": "^18.2.0",
    "typescript": "~5.5.2"
  }
}

```

# projects/global-marketplace/public/favicon.ico

This is a binary file of the type: Binary

# projects/global-marketplace/src/app/app.component.html

```html
<!-- * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * -->
<!-- * * * * * * * * * * * The content below * * * * * * * * * * * -->
<!-- * * * * * * * * * * is only a placeholder * * * * * * * * * * -->
<!-- * * * * * * * * * * and can be replaced.  * * * * * * * * * * -->
<!-- * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * -->
<!-- * * * * * * * * * Delete the template below * * * * * * * * * -->
<!-- * * * * * * * to get started with your project! * * * * * * * -->
<!-- * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * -->

<style>
  :host {
    --bright-blue: oklch(51.01% 0.274 263.83);
    --electric-violet: oklch(53.18% 0.28 296.97);
    --french-violet: oklch(47.66% 0.246 305.88);
    --vivid-pink: oklch(69.02% 0.277 332.77);
    --hot-red: oklch(61.42% 0.238 15.34);
    --orange-red: oklch(63.32% 0.24 31.68);

    --gray-900: oklch(19.37% 0.006 300.98);
    --gray-700: oklch(36.98% 0.014 302.71);
    --gray-400: oklch(70.9% 0.015 304.04);

    --red-to-pink-to-purple-vertical-gradient: linear-gradient(
      180deg,
      var(--orange-red) 0%,
      var(--vivid-pink) 50%,
      var(--electric-violet) 100%
    );

    --red-to-pink-to-purple-horizontal-gradient: linear-gradient(
      90deg,
      var(--orange-red) 0%,
      var(--vivid-pink) 50%,
      var(--electric-violet) 100%
    );

    --pill-accent: var(--bright-blue);

    font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
      "Segoe UI Symbol";
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1 {
    font-size: 3.125rem;
    color: var(--gray-900);
    font-weight: 500;
    line-height: 100%;
    letter-spacing: -0.125rem;
    margin: 0;
    font-family: "Inter Tight", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
      "Segoe UI Symbol";
  }

  p {
    margin: 0;
    color: var(--gray-700);
  }

  main {
    width: 100%;
    min-height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    box-sizing: inherit;
    position: relative;
  }

  .angular-logo {
    max-width: 9.2rem;
  }

  .content {
    display: flex;
    justify-content: space-around;
    width: 100%;
    max-width: 700px;
    margin-bottom: 3rem;
  }

  .content h1 {
    margin-top: 1.75rem;
  }

  .content p {
    margin-top: 1.5rem;
  }

  .divider {
    width: 1px;
    background: var(--red-to-pink-to-purple-vertical-gradient);
    margin-inline: 0.5rem;
  }

  .pill-group {
    display: flex;
    flex-direction: column;
    align-items: start;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .pill {
    display: flex;
    align-items: center;
    --pill-accent: var(--bright-blue);
    background: color-mix(in srgb, var(--pill-accent) 5%, transparent);
    color: var(--pill-accent);
    padding-inline: 0.75rem;
    padding-block: 0.375rem;
    border-radius: 2.75rem;
    border: 0;
    transition: background 0.3s ease;
    font-family: var(--inter-font);
    font-size: 0.875rem;
    font-style: normal;
    font-weight: 500;
    line-height: 1.4rem;
    letter-spacing: -0.00875rem;
    text-decoration: none;
  }

  .pill:hover {
    background: color-mix(in srgb, var(--pill-accent) 15%, transparent);
  }

  .pill-group .pill:nth-child(6n + 1) {
    --pill-accent: var(--bright-blue);
  }
  .pill-group .pill:nth-child(6n + 2) {
    --pill-accent: var(--french-violet);
  }
  .pill-group .pill:nth-child(6n + 3),
  .pill-group .pill:nth-child(6n + 4),
  .pill-group .pill:nth-child(6n + 5) {
    --pill-accent: var(--hot-red);
  }

  .pill-group svg {
    margin-inline-start: 0.25rem;
  }

  .social-links {
    display: flex;
    align-items: center;
    gap: 0.73rem;
    margin-top: 1.5rem;
  }

  .social-links path {
    transition: fill 0.3s ease;
    fill: var(--gray-400);
  }

  .social-links a:hover svg path {
    fill: var(--gray-900);
  }

  @media screen and (max-width: 650px) {
    .content {
      flex-direction: column;
      width: max-content;
    }

    .divider {
      height: 1px;
      width: 100%;
      background: var(--red-to-pink-to-purple-horizontal-gradient);
      margin-block: 1.5rem;
    }
  }
</style>

<main class="main">
  <div class="content">
    <div class="left-side">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 982 239"
        fill="none"
        class="angular-logo"
      >
        <g clip-path="url(#a)">
          <path
            fill="url(#b)"
            d="M388.676 191.625h30.849L363.31 31.828h-35.758l-56.215 159.797h30.848l13.174-39.356h60.061l13.256 39.356Zm-65.461-62.675 21.602-64.311h1.227l21.602 64.311h-44.431Zm126.831-7.527v70.202h-28.23V71.839h27.002v20.374h1.392c2.782-6.71 7.2-12.028 13.255-15.956 6.056-3.927 13.584-5.89 22.503-5.89 8.264 0 15.465 1.8 21.684 5.318 6.137 3.518 10.964 8.673 14.319 15.382 3.437 6.71 5.074 14.81 4.992 24.383v76.175h-28.23v-71.92c0-8.019-2.046-14.237-6.219-18.819-4.173-4.5-9.819-6.791-17.102-6.791-4.91 0-9.328 1.063-13.174 3.272-3.846 2.128-6.792 5.237-9.001 9.328-2.046 4.009-3.191 8.918-3.191 14.728ZM589.233 239c-10.147 0-18.82-1.391-26.103-4.091-7.282-2.7-13.092-6.382-17.511-10.964-4.418-4.582-7.528-9.655-9.164-15.219l25.448-6.136c1.145 2.372 2.782 4.663 4.991 6.954 2.209 2.291 5.155 4.255 8.837 5.81 3.683 1.554 8.428 2.291 14.074 2.291 8.019 0 14.647-1.964 19.884-5.81 5.237-3.845 7.856-10.227 7.856-19.064v-22.665h-1.391c-1.473 2.946-3.601 5.892-6.383 9.001-2.782 3.109-6.464 5.645-10.965 7.691-4.582 2.046-10.228 3.109-17.101 3.109-9.165 0-17.511-2.209-25.039-6.545-7.446-4.337-13.42-10.883-17.757-19.474-4.418-8.673-6.628-19.473-6.628-32.565 0-13.091 2.21-24.301 6.628-33.383 4.419-9.082 10.311-15.955 17.839-20.7 7.528-4.746 15.874-7.037 25.039-7.037 7.037 0 12.846 1.145 17.347 3.518 4.582 2.373 8.182 5.236 10.883 8.51 2.7 3.272 4.746 6.382 6.137 9.327h1.554v-19.8h27.821v121.749c0 10.228-2.454 18.737-7.364 25.447-4.91 6.709-11.538 11.7-20.048 15.055-8.509 3.355-18.165 4.991-28.884 4.991Zm.245-71.266c5.974 0 11.047-1.473 15.302-4.337 4.173-2.945 7.446-7.118 9.573-12.519 2.21-5.482 3.274-12.027 3.274-19.637 0-7.609-1.064-14.155-3.274-19.8-2.127-5.646-5.318-10.064-9.491-13.255-4.174-3.11-9.329-4.746-15.384-4.746s-11.537 1.636-15.792 4.91c-4.173 3.272-7.365 7.772-9.492 13.418-2.128 5.727-3.191 12.191-3.191 19.392 0 7.2 1.063 13.745 3.273 19.228 2.127 5.482 5.318 9.736 9.573 12.764 4.174 3.027 9.41 4.582 15.629 4.582Zm141.56-26.51V71.839h28.23v119.786h-27.412v-21.273h-1.227c-2.7 6.709-7.119 12.191-13.338 16.446-6.137 4.255-13.747 6.382-22.748 6.382-7.855 0-14.81-1.718-20.783-5.237-5.974-3.518-10.72-8.591-14.075-15.382-3.355-6.709-5.073-14.891-5.073-24.464V71.839h28.312v71.921c0 7.609 2.046 13.664 6.219 18.083 4.173 4.5 9.655 6.709 16.365 6.709 4.173 0 8.183-.982 12.111-3.028 3.927-2.045 7.118-5.072 9.655-9.082 2.537-4.091 3.764-9.164 3.764-15.218Zm65.707-109.395v159.796h-28.23V31.828h28.23Zm44.841 162.169c-7.61 0-14.402-1.391-20.457-4.091-6.055-2.7-10.883-6.791-14.32-12.109-3.518-5.319-5.237-11.946-5.237-19.801 0-6.791 1.228-12.355 3.765-16.773 2.536-4.419 5.891-7.937 10.228-10.637 4.337-2.618 9.164-4.664 14.647-6.055 5.4-1.391 11.046-2.373 16.856-3.027 7.037-.737 12.683-1.391 17.102-1.964 4.337-.573 7.528-1.555 9.574-2.782 1.963-1.309 3.027-3.273 3.027-5.973v-.491c0-5.891-1.718-10.391-5.237-13.664-3.518-3.191-8.51-4.828-15.056-4.828-6.955 0-12.356 1.473-16.447 4.5-4.009 3.028-6.71 6.546-8.183 10.719l-26.348-3.764c2.046-7.282 5.483-13.336 10.31-18.328 4.746-4.909 10.638-8.59 17.511-11.045 6.955-2.455 14.565-3.682 22.912-3.682 5.809 0 11.537.654 17.265 2.045s10.965 3.6 15.711 6.71c4.746 3.109 8.51 7.282 11.455 12.6 2.864 5.318 4.337 11.946 4.337 19.883v80.184h-27.166v-16.446h-.9c-1.719 3.355-4.092 6.464-7.201 9.328-3.109 2.864-6.955 5.237-11.619 6.955-4.828 1.718-10.229 2.536-16.529 2.536Zm7.364-20.701c5.646 0 10.556-1.145 14.729-3.354 4.173-2.291 7.364-5.237 9.655-9.001 2.292-3.763 3.355-7.854 3.355-12.273v-14.155c-.9.737-2.373 1.391-4.5 2.046-2.128.654-4.419 1.145-7.037 1.636-2.619.491-5.155.9-7.692 1.227-2.537.328-4.746.655-6.628.901-4.173.572-8.019 1.472-11.292 2.781-3.355 1.31-5.973 3.11-7.855 5.401-1.964 2.291-2.864 5.318-2.864 8.918 0 5.237 1.882 9.164 5.728 11.782 3.682 2.782 8.51 4.091 14.401 4.091Zm64.643 18.328V71.839h27.412v19.965h1.227c2.21-6.955 5.974-12.274 11.292-16.038 5.319-3.763 11.456-5.645 18.329-5.645 1.555 0 3.355.082 5.237.163 1.964.164 3.601.328 4.91.573v25.938c-1.227-.41-3.109-.819-5.646-1.146a58.814 58.814 0 0 0-7.446-.49c-5.155 0-9.738 1.145-13.829 3.354-4.091 2.209-7.282 5.236-9.655 9.164-2.373 3.927-3.519 8.427-3.519 13.5v70.448h-28.312ZM222.077 39.192l-8.019 125.923L137.387 0l84.69 39.192Zm-53.105 162.825-57.933 33.056-57.934-33.056 11.783-28.556h92.301l11.783 28.556ZM111.039 62.675l30.357 73.803H80.681l30.358-73.803ZM7.937 165.115 0 39.192 84.69 0 7.937 165.115Z"
          />
          <path
            fill="url(#c)"
            d="M388.676 191.625h30.849L363.31 31.828h-35.758l-56.215 159.797h30.848l13.174-39.356h60.061l13.256 39.356Zm-65.461-62.675 21.602-64.311h1.227l21.602 64.311h-44.431Zm126.831-7.527v70.202h-28.23V71.839h27.002v20.374h1.392c2.782-6.71 7.2-12.028 13.255-15.956 6.056-3.927 13.584-5.89 22.503-5.89 8.264 0 15.465 1.8 21.684 5.318 6.137 3.518 10.964 8.673 14.319 15.382 3.437 6.71 5.074 14.81 4.992 24.383v76.175h-28.23v-71.92c0-8.019-2.046-14.237-6.219-18.819-4.173-4.5-9.819-6.791-17.102-6.791-4.91 0-9.328 1.063-13.174 3.272-3.846 2.128-6.792 5.237-9.001 9.328-2.046 4.009-3.191 8.918-3.191 14.728ZM589.233 239c-10.147 0-18.82-1.391-26.103-4.091-7.282-2.7-13.092-6.382-17.511-10.964-4.418-4.582-7.528-9.655-9.164-15.219l25.448-6.136c1.145 2.372 2.782 4.663 4.991 6.954 2.209 2.291 5.155 4.255 8.837 5.81 3.683 1.554 8.428 2.291 14.074 2.291 8.019 0 14.647-1.964 19.884-5.81 5.237-3.845 7.856-10.227 7.856-19.064v-22.665h-1.391c-1.473 2.946-3.601 5.892-6.383 9.001-2.782 3.109-6.464 5.645-10.965 7.691-4.582 2.046-10.228 3.109-17.101 3.109-9.165 0-17.511-2.209-25.039-6.545-7.446-4.337-13.42-10.883-17.757-19.474-4.418-8.673-6.628-19.473-6.628-32.565 0-13.091 2.21-24.301 6.628-33.383 4.419-9.082 10.311-15.955 17.839-20.7 7.528-4.746 15.874-7.037 25.039-7.037 7.037 0 12.846 1.145 17.347 3.518 4.582 2.373 8.182 5.236 10.883 8.51 2.7 3.272 4.746 6.382 6.137 9.327h1.554v-19.8h27.821v121.749c0 10.228-2.454 18.737-7.364 25.447-4.91 6.709-11.538 11.7-20.048 15.055-8.509 3.355-18.165 4.991-28.884 4.991Zm.245-71.266c5.974 0 11.047-1.473 15.302-4.337 4.173-2.945 7.446-7.118 9.573-12.519 2.21-5.482 3.274-12.027 3.274-19.637 0-7.609-1.064-14.155-3.274-19.8-2.127-5.646-5.318-10.064-9.491-13.255-4.174-3.11-9.329-4.746-15.384-4.746s-11.537 1.636-15.792 4.91c-4.173 3.272-7.365 7.772-9.492 13.418-2.128 5.727-3.191 12.191-3.191 19.392 0 7.2 1.063 13.745 3.273 19.228 2.127 5.482 5.318 9.736 9.573 12.764 4.174 3.027 9.41 4.582 15.629 4.582Zm141.56-26.51V71.839h28.23v119.786h-27.412v-21.273h-1.227c-2.7 6.709-7.119 12.191-13.338 16.446-6.137 4.255-13.747 6.382-22.748 6.382-7.855 0-14.81-1.718-20.783-5.237-5.974-3.518-10.72-8.591-14.075-15.382-3.355-6.709-5.073-14.891-5.073-24.464V71.839h28.312v71.921c0 7.609 2.046 13.664 6.219 18.083 4.173 4.5 9.655 6.709 16.365 6.709 4.173 0 8.183-.982 12.111-3.028 3.927-2.045 7.118-5.072 9.655-9.082 2.537-4.091 3.764-9.164 3.764-15.218Zm65.707-109.395v159.796h-28.23V31.828h28.23Zm44.841 162.169c-7.61 0-14.402-1.391-20.457-4.091-6.055-2.7-10.883-6.791-14.32-12.109-3.518-5.319-5.237-11.946-5.237-19.801 0-6.791 1.228-12.355 3.765-16.773 2.536-4.419 5.891-7.937 10.228-10.637 4.337-2.618 9.164-4.664 14.647-6.055 5.4-1.391 11.046-2.373 16.856-3.027 7.037-.737 12.683-1.391 17.102-1.964 4.337-.573 7.528-1.555 9.574-2.782 1.963-1.309 3.027-3.273 3.027-5.973v-.491c0-5.891-1.718-10.391-5.237-13.664-3.518-3.191-8.51-4.828-15.056-4.828-6.955 0-12.356 1.473-16.447 4.5-4.009 3.028-6.71 6.546-8.183 10.719l-26.348-3.764c2.046-7.282 5.483-13.336 10.31-18.328 4.746-4.909 10.638-8.59 17.511-11.045 6.955-2.455 14.565-3.682 22.912-3.682 5.809 0 11.537.654 17.265 2.045s10.965 3.6 15.711 6.71c4.746 3.109 8.51 7.282 11.455 12.6 2.864 5.318 4.337 11.946 4.337 19.883v80.184h-27.166v-16.446h-.9c-1.719 3.355-4.092 6.464-7.201 9.328-3.109 2.864-6.955 5.237-11.619 6.955-4.828 1.718-10.229 2.536-16.529 2.536Zm7.364-20.701c5.646 0 10.556-1.145 14.729-3.354 4.173-2.291 7.364-5.237 9.655-9.001 2.292-3.763 3.355-7.854 3.355-12.273v-14.155c-.9.737-2.373 1.391-4.5 2.046-2.128.654-4.419 1.145-7.037 1.636-2.619.491-5.155.9-7.692 1.227-2.537.328-4.746.655-6.628.901-4.173.572-8.019 1.472-11.292 2.781-3.355 1.31-5.973 3.11-7.855 5.401-1.964 2.291-2.864 5.318-2.864 8.918 0 5.237 1.882 9.164 5.728 11.782 3.682 2.782 8.51 4.091 14.401 4.091Zm64.643 18.328V71.839h27.412v19.965h1.227c2.21-6.955 5.974-12.274 11.292-16.038 5.319-3.763 11.456-5.645 18.329-5.645 1.555 0 3.355.082 5.237.163 1.964.164 3.601.328 4.91.573v25.938c-1.227-.41-3.109-.819-5.646-1.146a58.814 58.814 0 0 0-7.446-.49c-5.155 0-9.738 1.145-13.829 3.354-4.091 2.209-7.282 5.236-9.655 9.164-2.373 3.927-3.519 8.427-3.519 13.5v70.448h-28.312ZM222.077 39.192l-8.019 125.923L137.387 0l84.69 39.192Zm-53.105 162.825-57.933 33.056-57.934-33.056 11.783-28.556h92.301l11.783 28.556ZM111.039 62.675l30.357 73.803H80.681l30.358-73.803ZM7.937 165.115 0 39.192 84.69 0 7.937 165.115Z"
          />
        </g>
        <defs>
          <radialGradient
            id="c"
            cx="0"
            cy="0"
            r="1"
            gradientTransform="rotate(118.122 171.182 60.81) scale(205.794)"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#FF41F8" />
            <stop offset=".707" stop-color="#FF41F8" stop-opacity=".5" />
            <stop offset="1" stop-color="#FF41F8" stop-opacity="0" />
          </radialGradient>
          <linearGradient
            id="b"
            x1="0"
            x2="982"
            y1="192"
            y2="192"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#F0060B" />
            <stop offset="0" stop-color="#F0070C" />
            <stop offset=".526" stop-color="#CC26D5" />
            <stop offset="1" stop-color="#7702FF" />
          </linearGradient>
          <clipPath id="a"><path fill="#fff" d="M0 0h982v239H0z" /></clipPath>
        </defs>
      </svg>
      <h1>Hello, {{ title }}</h1>
      <p>Congratulations! Your app is running. 🎉</p>
    </div>
    <div class="divider" role="separator" aria-label="Divider"></div>
    <div class="right-side">
      <div class="pill-group">
        @for (item of [
          { title: 'Explore the Docs', link: 'https://angular.dev' },
          { title: 'Learn with Tutorials', link: 'https://angular.dev/tutorials' },
          { title: 'CLI Docs', link: 'https://angular.dev/tools/cli' },
          { title: 'Angular Language Service', link: 'https://angular.dev/tools/language-service' },
          { title: 'Angular DevTools', link: 'https://angular.dev/tools/devtools' },
        ]; track item.title) {
          <a
            class="pill"
            [href]="item.link"
            target="_blank"
            rel="noopener"
          >
            <span>{{ item.title }}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="14"
              viewBox="0 -960 960 960"
              width="14"
              fill="currentColor"
            >
              <path
                d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h560v-280h80v280q0 33-23.5 56.5T760-120H200Zm188-212-56-56 372-372H560v-80h280v280h-80v-144L388-332Z"
              />
            </svg>
          </a>
        }
      </div>
      <div class="social-links">
        <a
          href="https://github.com/angular/angular"
          aria-label="Github"
          target="_blank"
          rel="noopener"
        >
          <svg
            width="25"
            height="24"
            viewBox="0 0 25 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            alt="Github"
          >
            <path
              d="M12.3047 0C5.50634 0 0 5.50942 0 12.3047C0 17.7423 3.52529 22.3535 8.41332 23.9787C9.02856 24.0946 9.25414 23.7142 9.25414 23.3871C9.25414 23.0949 9.24389 22.3207 9.23876 21.2953C5.81601 22.0377 5.09414 19.6444 5.09414 19.6444C4.53427 18.2243 3.72524 17.8449 3.72524 17.8449C2.61064 17.082 3.81137 17.0973 3.81137 17.0973C5.04697 17.1835 5.69604 18.3647 5.69604 18.3647C6.79321 20.2463 8.57636 19.7029 9.27978 19.3881C9.39052 18.5924 9.70736 18.0499 10.0591 17.7423C7.32641 17.4347 4.45429 16.3765 4.45429 11.6618C4.45429 10.3185 4.9311 9.22133 5.72065 8.36C5.58222 8.04931 5.16694 6.79833 5.82831 5.10337C5.82831 5.10337 6.85883 4.77319 9.2121 6.36459C10.1965 6.09082 11.2424 5.95546 12.2883 5.94931C13.3342 5.95546 14.3801 6.09082 15.3644 6.36459C17.7023 4.77319 18.7328 5.10337 18.7328 5.10337C19.3942 6.79833 18.9789 8.04931 18.8559 8.36C19.6403 9.22133 20.1171 10.3185 20.1171 11.6618C20.1171 16.3888 17.2409 17.4296 14.5031 17.7321C14.9338 18.1012 15.3337 18.8559 15.3337 20.0084C15.3337 21.6552 15.3183 22.978 15.3183 23.3779C15.3183 23.7009 15.5336 24.0854 16.1642 23.9623C21.0871 22.3484 24.6094 17.7341 24.6094 12.3047C24.6094 5.50942 19.0999 0 12.3047 0Z"
            />
          </svg>
        </a>
        <a
          href="https://twitter.com/angular"
          aria-label="Twitter"
          target="_blank"
          rel="noopener"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            alt="Twitter"
          >
            <path
              d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
            />
          </svg>
        </a>
        <a
          href="https://www.youtube.com/channel/UCbn1OgGei-DV7aSRo_HaAiw"
          aria-label="Youtube"
          target="_blank"
          rel="noopener"
        >
          <svg
            width="29"
            height="20"
            viewBox="0 0 29 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            alt="Youtube"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M27.4896 1.52422C27.9301 1.96749 28.2463 2.51866 28.4068 3.12258C29.0004 5.35161 29.0004 10 29.0004 10C29.0004 10 29.0004 14.6484 28.4068 16.8774C28.2463 17.4813 27.9301 18.0325 27.4896 18.4758C27.0492 18.9191 26.5 19.2389 25.8972 19.4032C23.6778 20 14.8068 20 14.8068 20C14.8068 20 5.93586 20 3.71651 19.4032C3.11363 19.2389 2.56449 18.9191 2.12405 18.4758C1.68361 18.0325 1.36732 17.4813 1.20683 16.8774C0.613281 14.6484 0.613281 10 0.613281 10C0.613281 10 0.613281 5.35161 1.20683 3.12258C1.36732 2.51866 1.68361 1.96749 2.12405 1.52422C2.56449 1.08095 3.11363 0.76113 3.71651 0.596774C5.93586 0 14.8068 0 14.8068 0C14.8068 0 23.6778 0 25.8972 0.596774C26.5 0.76113 27.0492 1.08095 27.4896 1.52422ZM19.3229 10L11.9036 5.77905V14.221L19.3229 10Z"
            />
          </svg>
        </a>
      </div>
    </div>
  </div>
</main>

<!-- * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * -->
<!-- * * * * * * * * * * * The content above * * * * * * * * * * * * -->
<!-- * * * * * * * * * * is only a placeholder * * * * * * * * * * * -->
<!-- * * * * * * * * * * and can be replaced.  * * * * * * * * * * * -->
<!-- * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * -->
<!-- * * * * * * * * * * End of Placeholder  * * * * * * * * * * * * -->
<!-- * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * -->


<router-outlet />

```

# projects/global-marketplace/src/app/app.component.scss

```scss

```

# projects/global-marketplace/src/app/app.component.spec.ts

```ts
import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'global-marketplace' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('global-marketplace');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, global-marketplace');
  });
});

```

# projects/global-marketplace/src/app/app.component.ts

```ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'global-marketplace';
}

```

# projects/global-marketplace/src/app/app.config.ts

```ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes)]
};

```

# projects/global-marketplace/src/app/app.routes.ts

```ts
import { Routes } from '@angular/router';

export const routes: Routes = [];

```

# projects/global-marketplace/src/index.html

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>GlobalMarketplace</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
</head>
<body>
  <app-root></app-root>
</body>
</html>

```

# projects/global-marketplace/src/main.ts

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

```

# projects/global-marketplace/src/styles.scss

```scss
/* You can add global styles to this file, and also import other style files */

```

# projects/global-marketplace/tsconfig.app.json

```json
/* To learn more about Typescript configuration file: https://www.typescriptlang.org/docs/handbook/tsconfig-json.html. */
/* To learn more about Angular compiler options: https://angular.dev/reference/configs/angular-compiler-options. */
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "../../out-tsc/app",
    "types": []
  },
  "files": [
    "src/main.ts"
  ],
  "include": [
    "src/**/*.d.ts"
  ]
}

```

# projects/global-marketplace/tsconfig.spec.json

```json
/* To learn more about Typescript configuration file: https://www.typescriptlang.org/docs/handbook/tsconfig-json.html. */
/* To learn more about Angular compiler options: https://angular.dev/reference/configs/angular-compiler-options. */
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "../../out-tsc/spec",
    "types": [
      "jasmine"
    ]
  },
  "include": [
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}

```

# projects/shared-types/ng-package.json

```json
{
  "$schema": "../../node_modules/ng-packagr/ng-package.schema.json",
  "dest": "../../dist/shared-types",
  "lib": {
    "entryFile": "src/public-api.ts"
  }
}
```

# projects/shared-types/package.json

```json
{
  "name": "shared-types",
  "version": "0.0.1",
  "peerDependencies": {
    "@angular/common": "^18.2.0",
    "@angular/core": "^18.2.0"
  },
  "dependencies": {
    "tslib": "^2.3.0"
  },
  "sideEffects": false
}

```

# projects/shared-types/src/lib/category.interface.ts

```ts
export interface Category {
  id: string; // Or number, depending on DB choice - using string for UUID flexibility
  name: string;
  imageUrl?: string; // Make optional to match entity
  description?: string; // Added based on Category Page plan
}

```

# projects/shared-types/src/lib/order.interface.ts

```ts
import { Address } from './user.interface'; // Assuming Address is in user.interface.ts

export interface OrderItem {
  productId: string; // Or number
  productName: string; // Denormalized for display
  variantInfo?: string; // e.g., "Size: L, Color: Blue"
  quantity: number;
  unitPrice: number; // Price at the time of order
  itemSubtotal: number;
}

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'completed'
  | 'cancelled'
  | 'failed';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Order {
  id: string; // Or number
  orderReference: string; // User-friendly reference number
  userId: string; // ID of the customer
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  taxes: number;
  discountAmount?: number;
  promoCode?: string;
  total: number;
  shippingAddress: Address;
  billingAddress?: Address; // Optional, if different from shipping
  shippingMethod: string;
  paymentMethod: string; // e.g., "Credit Card ending in 1234"
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  trackingNumber?: string;
  notes?: string; // Internal notes
  createdAt: Date;
  updatedAt: Date;
}

```

# projects/shared-types/src/lib/product.interface.ts

```ts
export interface Product {
  id: string; // Or number, depending on DB choice
  sku: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string; // Optional main image URL
  categoryIds: string[]; // IDs of categories it belongs to
  tags?: string[]; // e.g., 'New', 'Sale'
  stockLevel: number;
  isActive: boolean;
  // Add variant details later if needed
  // Add timestamps (createdAt, updatedAt) later
}

```

# projects/shared-types/src/lib/shared-types.component.spec.ts

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedTypesComponent } from './shared-types.component';

describe('SharedTypesComponent', () => {
  let component: SharedTypesComponent;
  let fixture: ComponentFixture<SharedTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedTypesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

# projects/shared-types/src/lib/shared-types.component.ts

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'lib-shared-types',
  standalone: true,
  imports: [],
  template: `
    <p>
      shared-types works!
    </p>
  `,
  styles: ``
})
export class SharedTypesComponent {

}

```

# projects/shared-types/src/lib/shared-types.service.spec.ts

```ts
import { TestBed } from '@angular/core/testing';

import { SharedTypesService } from './shared-types.service';

describe('SharedTypesService', () => {
  let service: SharedTypesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedTypesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

```

# projects/shared-types/src/lib/shared-types.service.ts

```ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedTypesService {

  constructor() { }
}

```

# projects/shared-types/src/lib/user.interface.ts

```ts
export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface User {
  id: string; // Or number
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  // Password hash should NOT be stored here, handled securely in backend
  roles: ('customer' | 'manager' | 'admin')[]; // Example roles
  addresses?: Address[];
  // Add timestamps later
}

```

# projects/shared-types/src/public-api.ts

```ts
/*
 * Public API Surface of shared-types
 */

// Remove default exports if not needed
// export * from './lib/shared-types.service';
// export * from './lib/shared-types.component';

export * from './lib/product.interface';
export * from './lib/user.interface';
export * from './lib/order.interface';
export * from './lib/category.interface';

```

# projects/shared-types/tsconfig.lib.json

```json
/* To learn more about Typescript configuration file: https://www.typescriptlang.org/docs/handbook/tsconfig-json.html. */
/* To learn more about Angular compiler options: https://angular.dev/reference/configs/angular-compiler-options. */
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "../../out-tsc/lib",
    "declaration": true,
    "declarationMap": true,
    "inlineSources": true,
    "types": []
  },
  "exclude": [
    "**/*.spec.ts"
  ]
}

```

# projects/shared-types/tsconfig.lib.prod.json

```json
/* To learn more about Typescript configuration file: https://www.typescriptlang.org/docs/handbook/tsconfig-json.html. */
/* To learn more about Angular compiler options: https://angular.dev/reference/configs/angular-compiler-options. */
{
  "extends": "./tsconfig.lib.json",
  "compilerOptions": {
    "declarationMap": false
  },
  "angularCompilerOptions": {
    "compilationMode": "partial"
  }
}

```

# projects/shared-types/tsconfig.spec.json

```json
/* To learn more about Typescript configuration file: https://www.typescriptlang.org/docs/handbook/tsconfig-json.html. */
/* To learn more about Angular compiler options: https://angular.dev/reference/configs/angular-compiler-options. */
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "../../out-tsc/spec",
    "types": [
      "jasmine"
    ]
  },
  "include": [
    "**/*.spec.ts",
    "**/*.d.ts"
  ]
}

```

# projects/store-management/public/favicon.ico

This is a binary file of the type: Binary

# projects/store-management/src/app/app.component.html

```html
<!-- * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * -->
<!-- * * * * * * * * * * * The content below * * * * * * * * * * * -->
<!-- * * * * * * * * * * is only a placeholder * * * * * * * * * * -->
<!-- * * * * * * * * * * and can be replaced.  * * * * * * * * * * -->
<!-- * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * -->
<!-- * * * * * * * * * Delete the template below * * * * * * * * * -->
<!-- * * * * * * * to get started with your project! * * * * * * * -->
<!-- * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * -->

<style>
  :host {
    --bright-blue: oklch(51.01% 0.274 263.83);
    --electric-violet: oklch(53.18% 0.28 296.97);
    --french-violet: oklch(47.66% 0.246 305.88);
    --vivid-pink: oklch(69.02% 0.277 332.77);
    --hot-red: oklch(61.42% 0.238 15.34);
    --orange-red: oklch(63.32% 0.24 31.68);

    --gray-900: oklch(19.37% 0.006 300.98);
    --gray-700: oklch(36.98% 0.014 302.71);
    --gray-400: oklch(70.9% 0.015 304.04);

    --red-to-pink-to-purple-vertical-gradient: linear-gradient(
      180deg,
      var(--orange-red) 0%,
      var(--vivid-pink) 50%,
      var(--electric-violet) 100%
    );

    --red-to-pink-to-purple-horizontal-gradient: linear-gradient(
      90deg,
      var(--orange-red) 0%,
      var(--vivid-pink) 50%,
      var(--electric-violet) 100%
    );

    --pill-accent: var(--bright-blue);

    font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
      "Segoe UI Symbol";
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1 {
    font-size: 3.125rem;
    color: var(--gray-900);
    font-weight: 500;
    line-height: 100%;
    letter-spacing: -0.125rem;
    margin: 0;
    font-family: "Inter Tight", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
      "Segoe UI Symbol";
  }

  p {
    margin: 0;
    color: var(--gray-700);
  }

  main {
    width: 100%;
    min-height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    box-sizing: inherit;
    position: relative;
  }

  .angular-logo {
    max-width: 9.2rem;
  }

  .content {
    display: flex;
    justify-content: space-around;
    width: 100%;
    max-width: 700px;
    margin-bottom: 3rem;
  }

  .content h1 {
    margin-top: 1.75rem;
  }

  .content p {
    margin-top: 1.5rem;
  }

  .divider {
    width: 1px;
    background: var(--red-to-pink-to-purple-vertical-gradient);
    margin-inline: 0.5rem;
  }

  .pill-group {
    display: flex;
    flex-direction: column;
    align-items: start;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .pill {
    display: flex;
    align-items: center;
    --pill-accent: var(--bright-blue);
    background: color-mix(in srgb, var(--pill-accent) 5%, transparent);
    color: var(--pill-accent);
    padding-inline: 0.75rem;
    padding-block: 0.375rem;
    border-radius: 2.75rem;
    border: 0;
    transition: background 0.3s ease;
    font-family: var(--inter-font);
    font-size: 0.875rem;
    font-style: normal;
    font-weight: 500;
    line-height: 1.4rem;
    letter-spacing: -0.00875rem;
    text-decoration: none;
  }

  .pill:hover {
    background: color-mix(in srgb, var(--pill-accent) 15%, transparent);
  }

  .pill-group .pill:nth-child(6n + 1) {
    --pill-accent: var(--bright-blue);
  }
  .pill-group .pill:nth-child(6n + 2) {
    --pill-accent: var(--french-violet);
  }
  .pill-group .pill:nth-child(6n + 3),
  .pill-group .pill:nth-child(6n + 4),
  .pill-group .pill:nth-child(6n + 5) {
    --pill-accent: var(--hot-red);
  }

  .pill-group svg {
    margin-inline-start: 0.25rem;
  }

  .social-links {
    display: flex;
    align-items: center;
    gap: 0.73rem;
    margin-top: 1.5rem;
  }

  .social-links path {
    transition: fill 0.3s ease;
    fill: var(--gray-400);
  }

  .social-links a:hover svg path {
    fill: var(--gray-900);
  }

  @media screen and (max-width: 650px) {
    .content {
      flex-direction: column;
      width: max-content;
    }

    .divider {
      height: 1px;
      width: 100%;
      background: var(--red-to-pink-to-purple-horizontal-gradient);
      margin-block: 1.5rem;
    }
  }
</style>

<main class="main">
  <div class="content">
    <div class="left-side">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 982 239"
        fill="none"
        class="angular-logo"
      >
        <g clip-path="url(#a)">
          <path
            fill="url(#b)"
            d="M388.676 191.625h30.849L363.31 31.828h-35.758l-56.215 159.797h30.848l13.174-39.356h60.061l13.256 39.356Zm-65.461-62.675 21.602-64.311h1.227l21.602 64.311h-44.431Zm126.831-7.527v70.202h-28.23V71.839h27.002v20.374h1.392c2.782-6.71 7.2-12.028 13.255-15.956 6.056-3.927 13.584-5.89 22.503-5.89 8.264 0 15.465 1.8 21.684 5.318 6.137 3.518 10.964 8.673 14.319 15.382 3.437 6.71 5.074 14.81 4.992 24.383v76.175h-28.23v-71.92c0-8.019-2.046-14.237-6.219-18.819-4.173-4.5-9.819-6.791-17.102-6.791-4.91 0-9.328 1.063-13.174 3.272-3.846 2.128-6.792 5.237-9.001 9.328-2.046 4.009-3.191 8.918-3.191 14.728ZM589.233 239c-10.147 0-18.82-1.391-26.103-4.091-7.282-2.7-13.092-6.382-17.511-10.964-4.418-4.582-7.528-9.655-9.164-15.219l25.448-6.136c1.145 2.372 2.782 4.663 4.991 6.954 2.209 2.291 5.155 4.255 8.837 5.81 3.683 1.554 8.428 2.291 14.074 2.291 8.019 0 14.647-1.964 19.884-5.81 5.237-3.845 7.856-10.227 7.856-19.064v-22.665h-1.391c-1.473 2.946-3.601 5.892-6.383 9.001-2.782 3.109-6.464 5.645-10.965 7.691-4.582 2.046-10.228 3.109-17.101 3.109-9.165 0-17.511-2.209-25.039-6.545-7.446-4.337-13.42-10.883-17.757-19.474-4.418-8.673-6.628-19.473-6.628-32.565 0-13.091 2.21-24.301 6.628-33.383 4.419-9.082 10.311-15.955 17.839-20.7 7.528-4.746 15.874-7.037 25.039-7.037 7.037 0 12.846 1.145 17.347 3.518 4.582 2.373 8.182 5.236 10.883 8.51 2.7 3.272 4.746 6.382 6.137 9.327h1.554v-19.8h27.821v121.749c0 10.228-2.454 18.737-7.364 25.447-4.91 6.709-11.538 11.7-20.048 15.055-8.509 3.355-18.165 4.991-28.884 4.991Zm.245-71.266c5.974 0 11.047-1.473 15.302-4.337 4.173-2.945 7.446-7.118 9.573-12.519 2.21-5.482 3.274-12.027 3.274-19.637 0-7.609-1.064-14.155-3.274-19.8-2.127-5.646-5.318-10.064-9.491-13.255-4.174-3.11-9.329-4.746-15.384-4.746s-11.537 1.636-15.792 4.91c-4.173 3.272-7.365 7.772-9.492 13.418-2.128 5.727-3.191 12.191-3.191 19.392 0 7.2 1.063 13.745 3.273 19.228 2.127 5.482 5.318 9.736 9.573 12.764 4.174 3.027 9.41 4.582 15.629 4.582Zm141.56-26.51V71.839h28.23v119.786h-27.412v-21.273h-1.227c-2.7 6.709-7.119 12.191-13.338 16.446-6.137 4.255-13.747 6.382-22.748 6.382-7.855 0-14.81-1.718-20.783-5.237-5.974-3.518-10.72-8.591-14.075-15.382-3.355-6.709-5.073-14.891-5.073-24.464V71.839h28.312v71.921c0 7.609 2.046 13.664 6.219 18.083 4.173 4.5 9.655 6.709 16.365 6.709 4.173 0 8.183-.982 12.111-3.028 3.927-2.045 7.118-5.072 9.655-9.082 2.537-4.091 3.764-9.164 3.764-15.218Zm65.707-109.395v159.796h-28.23V31.828h28.23Zm44.841 162.169c-7.61 0-14.402-1.391-20.457-4.091-6.055-2.7-10.883-6.791-14.32-12.109-3.518-5.319-5.237-11.946-5.237-19.801 0-6.791 1.228-12.355 3.765-16.773 2.536-4.419 5.891-7.937 10.228-10.637 4.337-2.618 9.164-4.664 14.647-6.055 5.4-1.391 11.046-2.373 16.856-3.027 7.037-.737 12.683-1.391 17.102-1.964 4.337-.573 7.528-1.555 9.574-2.782 1.963-1.309 3.027-3.273 3.027-5.973v-.491c0-5.891-1.718-10.391-5.237-13.664-3.518-3.191-8.51-4.828-15.056-4.828-6.955 0-12.356 1.473-16.447 4.5-4.009 3.028-6.71 6.546-8.183 10.719l-26.348-3.764c2.046-7.282 5.483-13.336 10.31-18.328 4.746-4.909 10.638-8.59 17.511-11.045 6.955-2.455 14.565-3.682 22.912-3.682 5.809 0 11.537.654 17.265 2.045s10.965 3.6 15.711 6.71c4.746 3.109 8.51 7.282 11.455 12.6 2.864 5.318 4.337 11.946 4.337 19.883v80.184h-27.166v-16.446h-.9c-1.719 3.355-4.092 6.464-7.201 9.328-3.109 2.864-6.955 5.237-11.619 6.955-4.828 1.718-10.229 2.536-16.529 2.536Zm7.364-20.701c5.646 0 10.556-1.145 14.729-3.354 4.173-2.291 7.364-5.237 9.655-9.001 2.292-3.763 3.355-7.854 3.355-12.273v-14.155c-.9.737-2.373 1.391-4.5 2.046-2.128.654-4.419 1.145-7.037 1.636-2.619.491-5.155.9-7.692 1.227-2.537.328-4.746.655-6.628.901-4.173.572-8.019 1.472-11.292 2.781-3.355 1.31-5.973 3.11-7.855 5.401-1.964 2.291-2.864 5.318-2.864 8.918 0 5.237 1.882 9.164 5.728 11.782 3.682 2.782 8.51 4.091 14.401 4.091Zm64.643 18.328V71.839h27.412v19.965h1.227c2.21-6.955 5.974-12.274 11.292-16.038 5.319-3.763 11.456-5.645 18.329-5.645 1.555 0 3.355.082 5.237.163 1.964.164 3.601.328 4.91.573v25.938c-1.227-.41-3.109-.819-5.646-1.146a58.814 58.814 0 0 0-7.446-.49c-5.155 0-9.738 1.145-13.829 3.354-4.091 2.209-7.282 5.236-9.655 9.164-2.373 3.927-3.519 8.427-3.519 13.5v70.448h-28.312ZM222.077 39.192l-8.019 125.923L137.387 0l84.69 39.192Zm-53.105 162.825-57.933 33.056-57.934-33.056 11.783-28.556h92.301l11.783 28.556ZM111.039 62.675l30.357 73.803H80.681l30.358-73.803ZM7.937 165.115 0 39.192 84.69 0 7.937 165.115Z"
          />
          <path
            fill="url(#c)"
            d="M388.676 191.625h30.849L363.31 31.828h-35.758l-56.215 159.797h30.848l13.174-39.356h60.061l13.256 39.356Zm-65.461-62.675 21.602-64.311h1.227l21.602 64.311h-44.431Zm126.831-7.527v70.202h-28.23V71.839h27.002v20.374h1.392c2.782-6.71 7.2-12.028 13.255-15.956 6.056-3.927 13.584-5.89 22.503-5.89 8.264 0 15.465 1.8 21.684 5.318 6.137 3.518 10.964 8.673 14.319 15.382 3.437 6.71 5.074 14.81 4.992 24.383v76.175h-28.23v-71.92c0-8.019-2.046-14.237-6.219-18.819-4.173-4.5-9.819-6.791-17.102-6.791-4.91 0-9.328 1.063-13.174 3.272-3.846 2.128-6.792 5.237-9.001 9.328-2.046 4.009-3.191 8.918-3.191 14.728ZM589.233 239c-10.147 0-18.82-1.391-26.103-4.091-7.282-2.7-13.092-6.382-17.511-10.964-4.418-4.582-7.528-9.655-9.164-15.219l25.448-6.136c1.145 2.372 2.782 4.663 4.991 6.954 2.209 2.291 5.155 4.255 8.837 5.81 3.683 1.554 8.428 2.291 14.074 2.291 8.019 0 14.647-1.964 19.884-5.81 5.237-3.845 7.856-10.227 7.856-19.064v-22.665h-1.391c-1.473 2.946-3.601 5.892-6.383 9.001-2.782 3.109-6.464 5.645-10.965 7.691-4.582 2.046-10.228 3.109-17.101 3.109-9.165 0-17.511-2.209-25.039-6.545-7.446-4.337-13.42-10.883-17.757-19.474-4.418-8.673-6.628-19.473-6.628-32.565 0-13.091 2.21-24.301 6.628-33.383 4.419-9.082 10.311-15.955 17.839-20.7 7.528-4.746 15.874-7.037 25.039-7.037 7.037 0 12.846 1.145 17.347 3.518 4.582 2.373 8.182 5.236 10.883 8.51 2.7 3.272 4.746 6.382 6.137 9.327h1.554v-19.8h27.821v121.749c0 10.228-2.454 18.737-7.364 25.447-4.91 6.709-11.538 11.7-20.048 15.055-8.509 3.355-18.165 4.991-28.884 4.991Zm.245-71.266c5.974 0 11.047-1.473 15.302-4.337 4.173-2.945 7.446-7.118 9.573-12.519 2.21-5.482 3.274-12.027 3.274-19.637 0-7.609-1.064-14.155-3.274-19.8-2.127-5.646-5.318-10.064-9.491-13.255-4.174-3.11-9.329-4.746-15.384-4.746s-11.537 1.636-15.792 4.91c-4.173 3.272-7.365 7.772-9.492 13.418-2.128 5.727-3.191 12.191-3.191 19.392 0 7.2 1.063 13.745 3.273 19.228 2.127 5.482 5.318 9.736 9.573 12.764 4.174 3.027 9.41 4.582 15.629 4.582Zm141.56-26.51V71.839h28.23v119.786h-27.412v-21.273h-1.227c-2.7 6.709-7.119 12.191-13.338 16.446-6.137 4.255-13.747 6.382-22.748 6.382-7.855 0-14.81-1.718-20.783-5.237-5.974-3.518-10.72-8.591-14.075-15.382-3.355-6.709-5.073-14.891-5.073-24.464V71.839h28.312v71.921c0 7.609 2.046 13.664 6.219 18.083 4.173 4.5 9.655 6.709 16.365 6.709 4.173 0 8.183-.982 12.111-3.028 3.927-2.045 7.118-5.072 9.655-9.082 2.537-4.091 3.764-9.164 3.764-15.218Zm65.707-109.395v159.796h-28.23V31.828h28.23Zm44.841 162.169c-7.61 0-14.402-1.391-20.457-4.091-6.055-2.7-10.883-6.791-14.32-12.109-3.518-5.319-5.237-11.946-5.237-19.801 0-6.791 1.228-12.355 3.765-16.773 2.536-4.419 5.891-7.937 10.228-10.637 4.337-2.618 9.164-4.664 14.647-6.055 5.4-1.391 11.046-2.373 16.856-3.027 7.037-.737 12.683-1.391 17.102-1.964 4.337-.573 7.528-1.555 9.574-2.782 1.963-1.309 3.027-3.273 3.027-5.973v-.491c0-5.891-1.718-10.391-5.237-13.664-3.518-3.191-8.51-4.828-15.056-4.828-6.955 0-12.356 1.473-16.447 4.5-4.009 3.028-6.71 6.546-8.183 10.719l-26.348-3.764c2.046-7.282 5.483-13.336 10.31-18.328 4.746-4.909 10.638-8.59 17.511-11.045 6.955-2.455 14.565-3.682 22.912-3.682 5.809 0 11.537.654 17.265 2.045s10.965 3.6 15.711 6.71c4.746 3.109 8.51 7.282 11.455 12.6 2.864 5.318 4.337 11.946 4.337 19.883v80.184h-27.166v-16.446h-.9c-1.719 3.355-4.092 6.464-7.201 9.328-3.109 2.864-6.955 5.237-11.619 6.955-4.828 1.718-10.229 2.536-16.529 2.536Zm7.364-20.701c5.646 0 10.556-1.145 14.729-3.354 4.173-2.291 7.364-5.237 9.655-9.001 2.292-3.763 3.355-7.854 3.355-12.273v-14.155c-.9.737-2.373 1.391-4.5 2.046-2.128.654-4.419 1.145-7.037 1.636-2.619.491-5.155.9-7.692 1.227-2.537.328-4.746.655-6.628.901-4.173.572-8.019 1.472-11.292 2.781-3.355 1.31-5.973 3.11-7.855 5.401-1.964 2.291-2.864 5.318-2.864 8.918 0 5.237 1.882 9.164 5.728 11.782 3.682 2.782 8.51 4.091 14.401 4.091Zm64.643 18.328V71.839h27.412v19.965h1.227c2.21-6.955 5.974-12.274 11.292-16.038 5.319-3.763 11.456-5.645 18.329-5.645 1.555 0 3.355.082 5.237.163 1.964.164 3.601.328 4.91.573v25.938c-1.227-.41-3.109-.819-5.646-1.146a58.814 58.814 0 0 0-7.446-.49c-5.155 0-9.738 1.145-13.829 3.354-4.091 2.209-7.282 5.236-9.655 9.164-2.373 3.927-3.519 8.427-3.519 13.5v70.448h-28.312ZM222.077 39.192l-8.019 125.923L137.387 0l84.69 39.192Zm-53.105 162.825-57.933 33.056-57.934-33.056 11.783-28.556h92.301l11.783 28.556ZM111.039 62.675l30.357 73.803H80.681l30.358-73.803ZM7.937 165.115 0 39.192 84.69 0 7.937 165.115Z"
          />
        </g>
        <defs>
          <radialGradient
            id="c"
            cx="0"
            cy="0"
            r="1"
            gradientTransform="rotate(118.122 171.182 60.81) scale(205.794)"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#FF41F8" />
            <stop offset=".707" stop-color="#FF41F8" stop-opacity=".5" />
            <stop offset="1" stop-color="#FF41F8" stop-opacity="0" />
          </radialGradient>
          <linearGradient
            id="b"
            x1="0"
            x2="982"
            y1="192"
            y2="192"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#F0060B" />
            <stop offset="0" stop-color="#F0070C" />
            <stop offset=".526" stop-color="#CC26D5" />
            <stop offset="1" stop-color="#7702FF" />
          </linearGradient>
          <clipPath id="a"><path fill="#fff" d="M0 0h982v239H0z" /></clipPath>
        </defs>
      </svg>
      <h1>Hello, {{ title }}</h1>
      <p>Congratulations! Your app is running. 🎉</p>
    </div>
    <div class="divider" role="separator" aria-label="Divider"></div>
    <div class="right-side">
      <div class="pill-group">
        @for (item of [
          { title: 'Explore the Docs', link: 'https://angular.dev' },
          { title: 'Learn with Tutorials', link: 'https://angular.dev/tutorials' },
          { title: 'CLI Docs', link: 'https://angular.dev/tools/cli' },
          { title: 'Angular Language Service', link: 'https://angular.dev/tools/language-service' },
          { title: 'Angular DevTools', link: 'https://angular.dev/tools/devtools' },
        ]; track item.title) {
          <a
            class="pill"
            [href]="item.link"
            target="_blank"
            rel="noopener"
          >
            <span>{{ item.title }}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="14"
              viewBox="0 -960 960 960"
              width="14"
              fill="currentColor"
            >
              <path
                d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h560v-280h80v280q0 33-23.5 56.5T760-120H200Zm188-212-56-56 372-372H560v-80h280v280h-80v-144L388-332Z"
              />
            </svg>
          </a>
        }
      </div>
      <div class="social-links">
        <a
          href="https://github.com/angular/angular"
          aria-label="Github"
          target="_blank"
          rel="noopener"
        >
          <svg
            width="25"
            height="24"
            viewBox="0 0 25 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            alt="Github"
          >
            <path
              d="M12.3047 0C5.50634 0 0 5.50942 0 12.3047C0 17.7423 3.52529 22.3535 8.41332 23.9787C9.02856 24.0946 9.25414 23.7142 9.25414 23.3871C9.25414 23.0949 9.24389 22.3207 9.23876 21.2953C5.81601 22.0377 5.09414 19.6444 5.09414 19.6444C4.53427 18.2243 3.72524 17.8449 3.72524 17.8449C2.61064 17.082 3.81137 17.0973 3.81137 17.0973C5.04697 17.1835 5.69604 18.3647 5.69604 18.3647C6.79321 20.2463 8.57636 19.7029 9.27978 19.3881C9.39052 18.5924 9.70736 18.0499 10.0591 17.7423C7.32641 17.4347 4.45429 16.3765 4.45429 11.6618C4.45429 10.3185 4.9311 9.22133 5.72065 8.36C5.58222 8.04931 5.16694 6.79833 5.82831 5.10337C5.82831 5.10337 6.85883 4.77319 9.2121 6.36459C10.1965 6.09082 11.2424 5.95546 12.2883 5.94931C13.3342 5.95546 14.3801 6.09082 15.3644 6.36459C17.7023 4.77319 18.7328 5.10337 18.7328 5.10337C19.3942 6.79833 18.9789 8.04931 18.8559 8.36C19.6403 9.22133 20.1171 10.3185 20.1171 11.6618C20.1171 16.3888 17.2409 17.4296 14.5031 17.7321C14.9338 18.1012 15.3337 18.8559 15.3337 20.0084C15.3337 21.6552 15.3183 22.978 15.3183 23.3779C15.3183 23.7009 15.5336 24.0854 16.1642 23.9623C21.0871 22.3484 24.6094 17.7341 24.6094 12.3047C24.6094 5.50942 19.0999 0 12.3047 0Z"
            />
          </svg>
        </a>
        <a
          href="https://twitter.com/angular"
          aria-label="Twitter"
          target="_blank"
          rel="noopener"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            alt="Twitter"
          >
            <path
              d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
            />
          </svg>
        </a>
        <a
          href="https://www.youtube.com/channel/UCbn1OgGei-DV7aSRo_HaAiw"
          aria-label="Youtube"
          target="_blank"
          rel="noopener"
        >
          <svg
            width="29"
            height="20"
            viewBox="0 0 29 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            alt="Youtube"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M27.4896 1.52422C27.9301 1.96749 28.2463 2.51866 28.4068 3.12258C29.0004 5.35161 29.0004 10 29.0004 10C29.0004 10 29.0004 14.6484 28.4068 16.8774C28.2463 17.4813 27.9301 18.0325 27.4896 18.4758C27.0492 18.9191 26.5 19.2389 25.8972 19.4032C23.6778 20 14.8068 20 14.8068 20C14.8068 20 5.93586 20 3.71651 19.4032C3.11363 19.2389 2.56449 18.9191 2.12405 18.4758C1.68361 18.0325 1.36732 17.4813 1.20683 16.8774C0.613281 14.6484 0.613281 10 0.613281 10C0.613281 10 0.613281 5.35161 1.20683 3.12258C1.36732 2.51866 1.68361 1.96749 2.12405 1.52422C2.56449 1.08095 3.11363 0.76113 3.71651 0.596774C5.93586 0 14.8068 0 14.8068 0C14.8068 0 23.6778 0 25.8972 0.596774C26.5 0.76113 27.0492 1.08095 27.4896 1.52422ZM19.3229 10L11.9036 5.77905V14.221L19.3229 10Z"
            />
          </svg>
        </a>
      </div>
    </div>
  </div>
</main>

<!-- * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * -->
<!-- * * * * * * * * * * * The content above * * * * * * * * * * * * -->
<!-- * * * * * * * * * * is only a placeholder * * * * * * * * * * * -->
<!-- * * * * * * * * * * and can be replaced.  * * * * * * * * * * * -->
<!-- * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * -->
<!-- * * * * * * * * * * End of Placeholder  * * * * * * * * * * * * -->
<!-- * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * -->


<router-outlet />

```

# projects/store-management/src/app/app.component.scss

```scss

```

# projects/store-management/src/app/app.component.spec.ts

```ts
import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'store-management' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('store-management');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, store-management');
  });
});

```

# projects/store-management/src/app/app.component.ts

```ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'store-management';
}

```

# projects/store-management/src/app/app.config.ts

```ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes)]
};

```

# projects/store-management/src/app/app.routes.ts

```ts
import { Routes } from '@angular/router';

export const routes: Routes = [];

```

# projects/store-management/src/index.html

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>StoreManagement</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
</head>
<body>
  <app-root></app-root>
</body>
</html>

```

# projects/store-management/src/main.ts

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

```

# projects/store-management/src/styles.scss

```scss
/* You can add global styles to this file, and also import other style files */

```

# projects/store-management/tsconfig.app.json

```json
/* To learn more about Typescript configuration file: https://www.typescriptlang.org/docs/handbook/tsconfig-json.html. */
/* To learn more about Angular compiler options: https://angular.dev/reference/configs/angular-compiler-options. */
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "../../out-tsc/app",
    "types": []
  },
  "files": [
    "src/main.ts"
  ],
  "include": [
    "src/**/*.d.ts"
  ]
}

```

# projects/store-management/tsconfig.spec.json

```json
/* To learn more about Typescript configuration file: https://www.typescriptlang.org/docs/handbook/tsconfig-json.html. */
/* To learn more about Angular compiler options: https://angular.dev/reference/configs/angular-compiler-options. */
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "../../out-tsc/spec",
    "types": [
      "jasmine"
    ]
  },
  "include": [
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}

```

# projects/storefront/Dockerfile.prod

```prod
# Stage 1: Build the Angular application
FROM node:20-slim AS builder

WORKDIR /usr/src/app

# Copy only package files first for better caching
COPY package.json package-lock.json* ./

# Install dependencies
# This layer is cached as long as lock files don't change
RUN npm install

# Now copy the rest of the necessary files for the build
COPY angular.json tsconfig.json ./
COPY projects/storefront/tsconfig.app.json ./projects/storefront/
COPY projects/storefront/tsconfig.spec.json ./projects/storefront/
# Copy the entire shared-types project directory
COPY projects/shared-types ./projects/shared-types
COPY projects/storefront/src ./projects/storefront/src
COPY projects/storefront/public ./projects/storefront/public

# Verify tsconfig.lib.json exists before building shared-types (Optional diagnostic)
# RUN ls -l /usr/src/app/projects/shared-types/tsconfig.lib.json

# Build the shared-types library (needed by storefront)
RUN npx ng build shared-types

# Build the storefront application for production
# Output path is defined in angular.json, usually 'dist/storefront'
RUN npx ng build storefront --configuration production

# Stage 2: Serve application with Nginx
FROM nginx:stable-alpine

# Copy built Angular app contents from builder stage's browser output directory to Nginx html directory
COPY --from=builder /usr/src/app/dist/storefront/browser /usr/share/nginx/html

# Copy the custom Nginx configuration (Optional if always mounted via compose)
# COPY docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Default command to start Nginx
CMD ["nginx", "-g", "daemon off;"]
```

# projects/storefront/public/favicon.ico

This is a binary file of the type: Binary

# projects/storefront/src/app/about/about-page/about-page.component.html

```html
<p>about-page works!</p>

```

# projects/storefront/src/app/about/about-page/about-page.component.scss

```scss

```

# projects/storefront/src/app/about/about-page/about-page.component.spec.ts

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutPageComponent } from './about-page.component';

describe('AboutPageComponent', () => {
  let component: AboutPageComponent;
  let fixture: ComponentFixture<AboutPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AboutPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

# projects/storefront/src/app/about/about-page/about-page.component.ts

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [],
  templateUrl: './about-page.component.html',
  styleUrl: './about-page.component.scss'
})
export class AboutPageComponent {

}

```

# projects/storefront/src/app/account/account-addresses/account-addresses.component.html

```html
<p>account-addresses works!</p>

```

# projects/storefront/src/app/account/account-addresses/account-addresses.component.scss

```scss

```

# projects/storefront/src/app/account/account-addresses/account-addresses.component.ts

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-account-addresses',
  standalone: true,
  imports: [],
  templateUrl: './account-addresses.component.html',
  styleUrl: './account-addresses.component.scss'
})
export class AccountAddressesComponent {

}

```

# projects/storefront/src/app/account/account-change-password/account-change-password.component.html

```html
<p>account-change-password works!</p>

```

# projects/storefront/src/app/account/account-change-password/account-change-password.component.scss

```scss

```

# projects/storefront/src/app/account/account-change-password/account-change-password.component.ts

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-account-change-password',
  standalone: true,
  imports: [],
  templateUrl: './account-change-password.component.html',
  styleUrl: './account-change-password.component.scss'
})
export class AccountChangePasswordComponent {

}

```

# projects/storefront/src/app/account/account-orders/account-orders.component.html

```html
<p>account-orders works!</p>

```

# projects/storefront/src/app/account/account-orders/account-orders.component.scss

```scss

```

# projects/storefront/src/app/account/account-orders/account-orders.component.ts

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-account-orders',
  standalone: true,
  imports: [],
  templateUrl: './account-orders.component.html',
  styleUrl: './account-orders.component.scss'
})
export class AccountOrdersComponent {

}

```

# projects/storefront/src/app/account/account-overview/account-overview.component.html

```html
<!-- Use async pipe to subscribe to currentUser$ -->
<div *ngIf="currentUser$ | async as user">
  <h3>Welcome back, {{ user.firstName }}!</h3>
  <p>This is your account overview. More details coming soon.</p>

  <!-- Placeholder sections based on plan -->
  <div class="overview-section">
    <h4>Recent Orders</h4>
    <p>No recent orders found.</p> <!-- Replace with actual data later -->
    <!-- <a routerLink="../orders">View all orders</a> -->
  </div>

  <div class="overview-section">
    <h4>Default Address</h4>
    <p>No default address set.</p> <!-- Replace with actual data later -->
     <!-- <a routerLink="../addresses">Manage addresses</a> -->
  </div>

</div>

<!-- Optional: Show loading or alternative message if user data isn't available yet -->
<div *ngIf="!(currentUser$ | async)">
  <p>Loading account details...</p>
</div>

```

# projects/storefront/src/app/account/account-overview/account-overview.component.scss

```scss

```

# projects/storefront/src/app/account/account-overview/account-overview.component.ts

```ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule for async pipe, *ngIf
import { AuthService } from '../../core/services/auth.service'; // Import AuthService
import { Observable } from 'rxjs';
import { User } from '@shared-types'; // Import User type

@Component({
  selector: 'app-account-overview',
  standalone: true,
  imports: [CommonModule], // Add CommonModule
  templateUrl: './account-overview.component.html',
  styleUrl: './account-overview.component.scss'
})
export class AccountOverviewComponent {
  private authService = inject(AuthService); // Inject AuthService

  // Expose the currentUser observable to the template
  currentUser$: Observable<Omit<User, 'passwordHash'> | null> = this.authService.currentUser$;

  // You could also use a snapshot if needed, but observable is preferred for reactivity
  // get currentUserSnapshot() {
  //   return this.authService.getCurrentUserSnapshot();
  // }
}

```

# projects/storefront/src/app/account/account-page/account-page.component.html

```html
<div class="account-container">
  <aside class="account-sidebar">
    <h2>My Account</h2>
    <nav class="account-nav">
      <ul>
        <!-- Use routerLinkActive for styling the active link -->
        <li><a routerLink="overview" routerLinkActive="active-link">Overview</a></li>
        <li><a routerLink="orders" routerLinkActive="active-link">Orders</a></li>
        <li><a routerLink="addresses" routerLinkActive="active-link">Addresses</a></li>
        <li><a routerLink="payment-methods" routerLinkActive="active-link">Payment Methods</a></li>
        <li><a routerLink="personal-info" routerLinkActive="active-link">Personal Information</a></li>
        <li><a routerLink="wishlist" routerLinkActive="active-link">Wishlist</a></li>
        <li><a routerLink="change-password" routerLinkActive="active-link">Change Password</a></li>
      </ul>
    </nav>
    <button (click)="logout()" class="btn btn-secondary logout-btn">Logout</button>
  </aside>

  <main class="account-content">
    <!-- Child routes will be rendered here -->
    <router-outlet></router-outlet>
  </main>
</div>

```

# projects/storefront/src/app/account/account-page/account-page.component.scss

```scss
@import '../../../styles/_variables.scss'; // Import SCSS variables first

:host {
  display: block; // Ensure the host element takes up space
  padding: $spacing-lg $container-padding-x; // Use SCSS vars
}

.account-container {
  display: flex;
  gap: $spacing-xl; // Use SCSS var
  max-width: $container-max-width; // Use SCSS var
  margin: 0 auto;
}

.account-sidebar {
  flex: 0 0 250px; // Fixed width for sidebar (adjust as needed)
  border-right: 1px solid $border-color; // Use SCSS var
  padding-right: $spacing-xl; // Use SCSS var

  h2 {
    font-size: 1.5rem;
    margin-bottom: $spacing-lg; // Use SCSS var
    color: $text-color; // Use SCSS var
  }

  .account-nav {
    ul {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        margin-bottom: $spacing-sm; // Use SCSS var

        a {
          display: block;
          padding: $spacing-sm $spacing-md; // Use SCSS vars
          color: $text-color-light; // Use SCSS var
          text-decoration: none;
          border-radius: $border-radius-sm; // Use SCSS var
          transition: background-color 0.2s ease, color 0.2s ease;

          &:hover {
            background-color: $neutral-light; // Use SCSS var
            color: $primary-color; // Use SCSS var
          }

          &.active-link { // Style for the active route
            background-color: $primary-color-light; // Use SCSS var
            color: $primary-color; // Use SCSS var
            font-weight: $font-weight-medium; // Use SCSS var
          }
        }
      }
    }
  }

  .logout-btn {
    margin-top: $spacing-xl; // Use SCSS var
    width: 100%;
    // Inherit button styles or add specific ones
  }
}

.account-content {
  flex: 1; // Takes up remaining space
  padding: $spacing-sm 0 $spacing-sm $spacing-md; // Use SCSS vars
}
```

# projects/storefront/src/app/account/account-page/account-page.component.spec.ts

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountPageComponent } from './account-page.component';

describe('AccountPageComponent', () => {
  let component: AccountPageComponent;
  let fixture: ComponentFixture<AccountPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

# projects/storefront/src/app/account/account-page/account-page.component.ts

```ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngIf etc. if needed later
import { AuthService } from '../../core/services/auth.service';
import { RouterModule } from '@angular/router'; // Import RouterModule

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [CommonModule, RouterModule], // Add RouterModule
  templateUrl: './account-page.component.html',
  styleUrl: './account-page.component.scss'
})
export class AccountPageComponent {

  // Inject AuthService
  constructor(private authService: AuthService) {}

  // Method to handle logout
  logout(): void {
    this.authService.logout();
    // Navigation is handled within AuthService.logout()
  }
}

```

# projects/storefront/src/app/account/account-payment-methods/account-payment-methods.component.html

```html
<p>account-payment-methods works!</p>

```

# projects/storefront/src/app/account/account-payment-methods/account-payment-methods.component.scss

```scss

```

# projects/storefront/src/app/account/account-payment-methods/account-payment-methods.component.ts

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-account-payment-methods',
  standalone: true,
  imports: [],
  templateUrl: './account-payment-methods.component.html',
  styleUrl: './account-payment-methods.component.scss'
})
export class AccountPaymentMethodsComponent {

}

```

# projects/storefront/src/app/account/account-personal-info/account-personal-info.component.html

```html
<p>account-personal-info works!</p>

```

# projects/storefront/src/app/account/account-personal-info/account-personal-info.component.scss

```scss

```

# projects/storefront/src/app/account/account-personal-info/account-personal-info.component.ts

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-account-personal-info',
  standalone: true,
  imports: [],
  templateUrl: './account-personal-info.component.html',
  styleUrl: './account-personal-info.component.scss'
})
export class AccountPersonalInfoComponent {

}

```

# projects/storefront/src/app/account/account-wishlist/account-wishlist.component.html

```html
<p>account-wishlist works!</p>

```

# projects/storefront/src/app/account/account-wishlist/account-wishlist.component.scss

```scss

```

# projects/storefront/src/app/account/account-wishlist/account-wishlist.component.ts

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-account-wishlist',
  standalone: true,
  imports: [],
  templateUrl: './account-wishlist.component.html',
  styleUrl: './account-wishlist.component.scss'
})
export class AccountWishlistComponent {

}

```

# projects/storefront/src/app/app.component.html

```html
<app-header></app-header>

<main>
  <router-outlet></router-outlet>
</main>

<app-footer></app-footer>

```

# projects/storefront/src/app/app.component.scss

```scss

```

# projects/storefront/src/app/app.component.spec.ts

```ts
import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'storefront' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('storefront');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, storefront');
  });
});

```

# projects/storefront/src/app/app.component.ts

```ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './core/components/header/header.component'; // Import Header
import { FooterComponent } from './core/components/footer/footer.component'; // Import Footer

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent], // Add Header and Footer to imports
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'storefront';
}

```

# projects/storefront/src/app/app.config.ts

```ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; // Import withInterceptors

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor'; // Import the functional interceptor

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])), // Provide the functional interceptor
  ],
};

```

# projects/storefront/src/app/app.routes.ts

```ts
import { Routes } from '@angular/router';
// Import the generated components for direct routing
import { ShopPageComponent } from './shop/shop-page/shop-page.component';
import { AboutPageComponent } from './about/about-page/about-page.component';
import { ContactPageComponent } from './contact/contact-page/contact-page.component';
import { AccountPageComponent } from './account/account-page/account-page.component';
import { CartPageComponent } from './cart/cart-page/cart-page.component';
import { FaqPageComponent } from './faq/faq-page/faq-page.component';
import { ShippingPolicyPageComponent } from './shipping-policy/shipping-policy-page/shipping-policy-page.component';
import { ReturnPolicyPageComponent } from './return-policy/return-policy-page/return-policy-page.component';
import { RegistrationPageComponent } from './registration-page/registration-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
// Import Account section components
import { AccountOverviewComponent } from './account/account-overview/account-overview.component';
import { AccountOrdersComponent } from './account/account-orders/account-orders.component';
import { AccountAddressesComponent } from './account/account-addresses/account-addresses.component';
import { AccountPaymentMethodsComponent } from './account/account-payment-methods/account-payment-methods.component';
import { AccountPersonalInfoComponent } from './account/account-personal-info/account-personal-info.component';
import { AccountWishlistComponent } from './account/account-wishlist/account-wishlist.component';
import { AccountChangePasswordComponent } from './account/account-change-password/account-change-password.component';
// Import Auth Guard
import { authGuard } from './core/guards/auth.guard';
export const routes: Routes = [
  // Redirect root path to a default store or a store selection page (TBD)
  // For now, let's redirect to a default store slug for testing
  { path: '', redirectTo: '/awesome-gadgets', pathMatch: 'full' },

  // Parent route to capture the store slug
  {
    path: ':storeSlug',
    // We can add a component here later if needed (e.g., a StoreLayoutComponent)
    // or a resolver to fetch store details based on the slug
    children: [
      // Existing routes moved under the :storeSlug parameter
      {
        path: '', // Default path for a store (e.g., /awesome-gadgets)
        loadChildren: () =>
          import('./home/home.module').then((m) => m.HomeModule),
      },
      {
        path: 'category', // e.g., /awesome-gadgets/category
        loadChildren: () =>
          import('./category/category.module').then((m) => m.CategoryModule),
      },
      {
        path: 'product', // e.g., /awesome-gadgets/product
        loadChildren: () =>
          import('./product/product.module').then((m) => m.ProductModule),
      },
  // Routes for the newly generated standalone components
      {
        path: 'shop', // e.g., /awesome-gadgets/shop
        component: ShopPageComponent
      },
      {
        path: 'about', // e.g., /awesome-gadgets/about
        component: AboutPageComponent
      },
      {
        path: 'contact', // e.g., /awesome-gadgets/contact
        component: ContactPageComponent
      },
      {
        path: 'account', // e.g., /awesome-gadgets/account
        component: AccountPageComponent,
        canActivate: [authGuard],
        children: [
          { path: '', redirectTo: 'overview', pathMatch: 'full' },
          { path: 'overview', component: AccountOverviewComponent },
          { path: 'orders', component: AccountOrdersComponent },
          { path: 'addresses', component: AccountAddressesComponent },
          { path: 'payment-methods', component: AccountPaymentMethodsComponent },
          { path: 'personal-info', component: AccountPersonalInfoComponent },
          { path: 'wishlist', component: AccountWishlistComponent },
          { path: 'change-password', component: AccountChangePasswordComponent },
        ]
      },
      {
        path: 'cart', // e.g., /awesome-gadgets/cart
        component: CartPageComponent
      },
  // Routes for footer links
      // Footer links - these might need to be store-specific too
      {
        path: 'faq', // e.g., /awesome-gadgets/faq
        component: FaqPageComponent
      },
      {
        path: 'shipping', // e.g., /awesome-gadgets/shipping
        component: ShippingPolicyPageComponent
      },
      {
        path: 'returns', // e.g., /awesome-gadgets/returns
        component: ReturnPolicyPageComponent
      },
  // Auth Routes
      // Auth routes - these are likely global, not store-specific, so keep outside :storeSlug
      // Or maybe they should be under store? TBD. For now, keep them separate.
      // {
      //   path: 'register',
      //   component: RegistrationPageComponent
      // },
      // {
      //   path: 'login',
      //   component: LoginPageComponent
      // },
      // Move Auth Routes inside :storeSlug
      {
        path: 'register', // e.g., /awesome-gadgets/register
        component: RegistrationPageComponent
      },
      {
        path: 'login', // e.g., /awesome-gadgets/login
        component: LoginPageComponent
      },
    ]
  },

  // Consider adding a wildcard route for 404 page at the end
  // { path: '**', component: NotFoundPageComponent }
  // Consider adding a wildcard route for 404 page at the end
  // { path: '**', component: NotFoundPageComponent }
];

```

# projects/storefront/src/app/cart/cart-page/cart-page.component.html

```html
<div class="cart-page-container" *ngIf="cartState$ | async as cartState; else loadingCart">
  <h1>Shopping Cart</h1>

  <ng-container *ngIf="cartState.items.length > 0; else emptyCart">
    <div class="cart-layout">
      <!-- Left Section: Cart Items -->
      <div class="cart-items-section">
        <table>
          <thead>
            <tr>
              <th colspan="2">Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Subtotal</th>
              <th></th> <!-- For remove button -->
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of cartState.items" class="cart-item">
              <td class="item-image">
                <a [routerLink]="['/product', item.product.id]">
                  <img [src]="item.product.imageUrl || '/assets/images/placeholder.png'" [alt]="item.product.name">
                </a>
              </td>
              <td class="item-details">
                <a [routerLink]="['/product', item.product.id]" class="item-name">{{ item.product.name }}</a>
                <!-- Display selected variants later if applicable -->
              </td>
              <td class="item-price">{{ item.product.price | currency }}</td>
              <td class="item-quantity">
                <!-- Basic quantity input - enhance later -->
                <input type="number"
                       [ngModel]="item.quantity"
                       (ngModelChange)="updateQuantity(item, $event)"
                       min="1"
                       step="1">
              </td>
              <td class="item-subtotal">{{ calculateItemSubtotal(item) | currency }}</td>
              <td class="item-remove">
                <button (click)="removeItem(item)" title="Remove Item">&times;</button> <!-- Simple remove button -->
              </td>
            </tr>
          </tbody>
        </table>
        <div class="cart-actions-lower">
          <button class="continue-shopping-btn" [routerLink]="['/']">Continue Shopping</button>
          <button class="update-cart-btn" (click)="updateCart()">Update Cart</button> <!-- Might not be needed if quantity updates automatically -->
        </div>
      </div>

      <!-- Right Section: Order Summary -->
      <aside class="order-summary-section">
        <h2>Order Summary</h2>
        <div class="summary-row">
          <span>Subtotal:</span>
          <span>{{ calculateCartSubtotal(cartState.items) | currency }}</span>
        </div>
        <div class="summary-row">
          <span>Shipping:</span>
          <span>(Calculated at checkout)</span>
        </div>
        <div class="summary-row">
          <span>Taxes:</span>
          <span>(Calculated at checkout)</span>
        </div>
        <hr>
        <div class="summary-row total">
          <span>Total:</span>
          <!-- Calculate total later including shipping/taxes -->
          <span>{{ calculateCartSubtotal(cartState.items) | currency }}</span>
        </div>
        <div class="promo-code">
          <label for="promo">Promo Code:</label>
          <input type="text" id="promo" placeholder="Enter code">
          <button>Apply</button>
        </div>
        <button class="checkout-btn" (click)="proceedToCheckout()">Proceed to Checkout</button>
      </aside>
    </div>
  </ng-container>

  <ng-template #emptyCart>
    <div class="empty-cart-message">
      <p>Your shopping cart is empty.</p>
      <button [routerLink]="['/']">Shop Now</button>
    </div>
  </ng-template>
</div>

<ng-template #loadingCart>
  <p>Loading cart...</p>
</ng-template>

```

# projects/storefront/src/app/cart/cart-page/cart-page.component.scss

```scss
@import '../../../styles/_variables.scss'; // Correct path relative to src/app

:host {
  display: block;
}

.cart-page-container {
  width: 100%;
  max-width: var(--container-max-width);
  margin: var(--spacing-xl) auto;
  padding: 0 var(--container-padding-x);

  h1 {
    text-align: center;
    margin-bottom: var(--spacing-xl);
  }
}

.cart-layout {
  display: grid;
  grid-template-columns: 2fr 1fr; // Adjust ratio as needed
  gap: var(--spacing-xl);

  @media (max-width: 992px) { // Stack on smaller screens
    grid-template-columns: 1fr;
  }
}

// --- Cart Items Section ---
.cart-items-section {
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: var(--spacing-lg);

    thead {
      border-bottom: 2px solid var(--border-color);
      th {
        text-align: left;
        padding: var(--spacing-sm) var(--spacing-md);
        font-weight: var(--font-weight-medium);
        color: var(--text-color-light);
        font-size: 0.9rem;
        text-transform: uppercase;
      }
    }

    tbody {
      tr.cart-item {
        border-bottom: 1px solid var(--border-color);
        td {
          padding: var(--spacing-md);
          vertical-align: middle;
        }
      }
    }
  }

  .item-image {
    width: 80px; // Fixed image width
    img {
      display: block;
      width: 100%;
      height: auto;
      border: 1px solid var(--neutral-light);
      border-radius: var(--border-radius-sm);
    }
  }

  .item-details {
    .item-name {
      font-weight: var(--font-weight-medium);
      color: var(--text-color);
      text-decoration: none;
      &:hover {
        color: var(--primary-color);
      }
    }
    // Add styles for variant display later
  }

  .item-price,
  .item-subtotal {
    font-weight: var(--font-weight-medium);
  }

  .item-quantity {
    width: 100px; // Limit width
    input[type="number"] {
      width: 60px; // Smaller input
      text-align: center;
      padding: var(--spacing-xs);
    }
  }

  .item-remove {
    width: 40px;
    text-align: center;
    button {
      background: none;
      border: none;
      color: var(--error-color);
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      &:hover {
        opacity: 0.7;
      }
    }
  }

  .cart-actions-lower {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: var(--spacing-lg);

    .continue-shopping-btn {
      // Use secondary style
      // Apply secondary button styles using SCSS variables
      color: $primary-color;
      background-color: transparent;
      border-color: $primary-color;

      &:hover, &:focus {
        background-color: rgba($primary-color, 0.1); // Use SCSS var in rgba()
        opacity: 1; // Keep opacity for focus state consistency if needed
      }
    }
    .update-cart-btn {
      // Optional button, might be removed
    }
  }
}


// --- Order Summary Section ---
.order-summary-section {
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  background-color: var(--neutral-lightest);
  align-self: start; // Prevent stretching

  h2 {
    font-size: 1.4rem;
    margin-bottom: var(--spacing-lg);
    border-bottom: 1px solid var(--border-color);
    padding-bottom: var(--spacing-md);
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--spacing-sm);
    font-size: 1rem;

    span:last-child {
      font-weight: var(--font-weight-medium);
    }

    &.total {
      font-size: 1.2rem;
      font-weight: var(--font-weight-bold);
      margin-top: var(--spacing-md);
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--border-color);
    }
  }

  hr {
    border: none;
    border-top: 1px dashed var(--border-color);
    margin: var(--spacing-md) 0;
  }

  .promo-code {
    margin-top: var(--spacing-lg);
    display: flex;
    gap: var(--spacing-sm);
    label { display: none; } // Hide label visually if needed
    input[type="text"] {
      flex-grow: 1;
    }
    button {
      flex-shrink: 0;
      // Use secondary style
      // Apply secondary button styles using SCSS variables
      color: $primary-color;
      background-color: transparent;
      border-color: $primary-color;

      &:hover, &:focus {
        background-color: rgba($primary-color, 0.1); // Use SCSS var in rgba()
        opacity: 1; // Keep opacity for focus state consistency if needed
      }
    }
  }

  .checkout-btn {
    width: 100%;
    margin-top: var(--spacing-lg);
    padding: var(--spacing-md);
    font-size: 1.1rem;
    background-color: var(--success-color); // Green for checkout
    border-color: var(--success-color);
    &:hover {
      opacity: 0.85;
    }
  }
}

// --- Empty Cart ---
.empty-cart-message {
  text-align: center;
  padding: var(--spacing-xxl) 0;
  border: 1px dashed var(--border-color);
  border-radius: var(--border-radius-md);
  background-color: var(--neutral-lightest);

  p {
    font-size: 1.2rem;
    color: var(--text-color-light);
    margin-bottom: var(--spacing-lg);
  }
  button {
    // Use primary button style
  }
}

// Loading state
p {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-color-light);
}
```

# projects/storefront/src/app/cart/cart-page/cart-page.component.spec.ts

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartPageComponent } from './cart-page.component';

describe('CartPageComponent', () => {
  let component: CartPageComponent;
  let fixture: ComponentFixture<CartPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CartPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

# projects/storefront/src/app/cart/cart-page/cart-page.component.ts

```ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // For async pipe, ngIf, ngFor
import { RouterModule } from '@angular/router'; // For routerLink
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { Observable } from 'rxjs';
import { CartService, CartState, CartItem } from '../../core/services/cart.service'; // Import service and interfaces
import { Product } from '@shared-types'; // Import Product type if needed

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, // For "Continue Shopping" link
    FormsModule   // Add FormsModule for ngModel
  ],
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.scss'
})
export class CartPageComponent {
  private cartService = inject(CartService);

  // Expose the cart state observable directly to the template
  cartState$: Observable<CartState> = this.cartService.cartState$;

  // Method to calculate item subtotal
  calculateItemSubtotal(item: CartItem): number {
    // Need to handle the case where product details might be missing initially
    // This assumes the product object on CartItem will eventually be populated
    // or the price is fetched/available somehow.
    // For now, using a placeholder or assuming price exists if item exists.
    // A better approach might involve fetching product details if needed.
    const price = item.product?.price || 0; // Use 0 if price is missing
    return price * item.quantity;
  }

  // Method to calculate cart subtotal
  calculateCartSubtotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + this.calculateItemSubtotal(item), 0);
  }

  // Method to handle quantity updates from the input
  updateQuantity(item: CartItem, quantityString: string): void {
    const newQuantity = parseInt(quantityString, 10);
    // Basic validation
    if (isNaN(newQuantity) || newQuantity < 0) {
      console.warn(`Invalid quantity input: ${quantityString}.`);
      // TODO: Reset input to current quantity?
      return;
    }

    if (newQuantity === 0) {
      // Treat setting quantity to 0 as removing the item
      this.removeItem(item);
    } else if (item.product?.id) { // Ensure product ID exists
      this.cartService.updateItemQuantity(item.product.id, newQuantity).subscribe({
         next: () => console.log('Quantity update request sent.'),
         error: (err) => console.error('Error updating quantity:', err)
         // State update is handled within the service
       });
    } else {
      console.error('Cannot update quantity, product ID missing from item:', item);
    }
  }

  // Method to handle removing an item
  removeItem(item: CartItem): void {
    if (item.product?.id) { // Ensure product ID exists
      this.cartService.removeItem(item.product.id).subscribe({
         next: () => console.log('Remove item request sent.'),
         error: (err) => console.error('Error removing item:', err)
         // State update is handled within the service
       });
    } else {
       console.error('Cannot remove item, product ID missing from item:', item);
    }
  }

  // Placeholder method for "Update Cart" button (might not be needed)
  updateCart(): void {
    console.log('Update Cart button clicked. Logic might be handled by quantity changes directly.');
    // Potentially useful if batching updates or recalculating totals explicitly
  }

  // Placeholder method for "Proceed to Checkout" button
  proceedToCheckout(): void {
    console.log('Proceeding to checkout...');
    // TODO: Implement navigation to checkout route
    // this.router.navigate(['/checkout']);
  }
}

```

# projects/storefront/src/app/category/category-page/category-page.component.html

```html
<!-- Main container, waits for category data -->
<div class="category-page-container" *ngIf="category$ | async as category; else loadingCategory">

  <!-- Breadcrumbs -->
  <div class="breadcrumbs">
    <a [routerLink]="['/']">Home</a> > <span>{{ category.name }}</span>
  </div>

  <!-- Category Header -->
  <div class="category-header">
    <h1>{{ category.name }}</h1>
    <p>{{ category.description }}</p>
  </div>

  <div class="category-content">
    <!-- Filter Sidebar (Left) -->
    <aside class="filter-sidebar">
      <h2>Filters</h2>

      <!-- Price Filter Example -->
      <div class="filter-group">
        <h3>Price Range</h3>
        <select [(ngModel)]="selectedPriceRange" (ngModelChange)="applyFilters()">
          <option value="">All Prices</option>
          <option value="0-20">$0 - $20</option>
          <option value="20-50">$20 - $50</option>
          <option value="50-100">$50 - $100</option>
          <option value="100-Infinity">$100+</option>
        </select>
      </div>

      <!-- Tags Filter Example -->
      <div class="filter-group">
        <h3>Tags</h3>
        <!-- Assuming tags are fetched or predefined -->
        <div *ngFor="let tag of ['New', 'Sale', 'Featured']"> <!-- Example tags -->
          <label>
            <input type="checkbox" [(ngModel)]="selectedTags[tag]" (ngModelChange)="applyFilters()">
            {{ tag }}
          </label>
        </div>
      </div>

      <!-- Add other filters (color, size) similarly -->

      <button (click)="clearFilters()">Clear All Filters</button>
    </aside>

    <!-- Main Content Area (Right) -->
    <main class="main-content">
      <!-- Sorting Options -->
      <div class="sorting-options">
        <label for="sort">Sort by:</label>
        <!-- Bind to public sortSubject.value -->
        <select id="sort" [ngModel]="sortSubject.value" (ngModelChange)="onSortChange($event)">
          <option value="newest">Newest</option>
          <option value="price-asc">Price Low-High</option>
          <option value="price-desc">Price High-Low</option>
          <option value="best-selling">Best Selling</option> <!-- Assuming API supports this -->
        </select>
      </div>

      <!-- Product Grid -->
      <div class="product-grid-wrapper"> <!-- Added wrapper for loading/empty state -->
        <ng-container *ngIf="products$ | async as products; else loadingProducts">
          <div class="product-grid" *ngIf="products.length > 0; else noProducts">
            <app-product-card *ngFor="let product of products" [product]="product" [storeSlug]="currentStoreSlug$ | async"></app-product-card> <!-- Pass storeSlug -->
          </div>
          <ng-template #noProducts>
            <p>No products found matching your criteria.</p>
          </ng-template>
        </ng-container>
        <ng-template #loadingProducts><p>Loading products...</p></ng-template>
      </div>


      <!-- Pagination -->
      <!-- Corrected *ngIf syntax -->
      <div class="pagination" *ngIf="{ total: totalProducts$ | async, page: page$ | async } as paginationData">
         <ng-container *ngIf="paginationData.total !== null && paginationData.page !== null && paginationData.total > 0">
           <button (click)="onPageChange(paginationData.page - 1)" [disabled]="paginationData.page <= 1">Previous</button>
           <span>Page {{ paginationData.page }} of {{ calculateTotalPages(paginationData.total) }}</span>
           <button (click)="onPageChange(paginationData.page + 1)" [disabled]="paginationData.page >= calculateTotalPages(paginationData.total)">Next</button>
           <p>Total Products: {{ paginationData.total }}</p>
         </ng-container>
      </div>
    </main>
  </div>
</div>

<!-- Loading template for category -->
<ng-template #loadingCategory><p>Loading category details...</p></ng-template>

```

# projects/storefront/src/app/category/category-page/category-page.component.scss

```scss
// Using global variables defined in src/styles.scss

:host {
  display: block;
}

.category-page-container {
  // Use the global container for max-width and padding
  width: 100%;
  max-width: var(--container-max-width);
  margin: var(--spacing-xl) auto; // Add vertical margin
  padding: 0 var(--container-padding-x);
}

.breadcrumbs {
  margin-bottom: var(--spacing-md);
  font-size: 0.9rem;
  color: var(--text-color-light);

  a {
    color: var(--text-color-light);
    &:hover {
      color: var(--primary-color);
    }
  }

  span {
    font-weight: var(--font-weight-medium);
    color: var(--text-color);
  }
}

.category-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);

  h1 {
    margin-bottom: var(--spacing-sm);
  }
  p {
    color: var(--text-color-light);
    max-width: 70ch; // Limit description width for readability
    margin: 0 auto;
  }
}

.category-content {
  display: grid;
  grid-template-columns: 240px 1fr; // Fixed sidebar width, flexible main content
  gap: var(--spacing-xl);

  @media (max-width: 768px) { // Stack on smaller screens
    grid-template-columns: 1fr;
  }
}

.filter-sidebar {
  border: var(--border-width) solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  background-color: var(--neutral-lightest);
  align-self: start; // Prevent sidebar stretching vertically

  h2 {
    font-size: 1.4rem;
    margin-bottom: var(--spacing-lg);
    border-bottom: var(--border-width) solid var(--border-color);
    padding-bottom: var(--spacing-sm);
  }

  .filter-group {
    margin-bottom: var(--spacing-lg);

    h3 {
      font-size: 1.1rem;
      font-weight: var(--font-weight-medium);
      margin-bottom: var(--spacing-md);
    }

    select, label {
      display: block;
      margin-bottom: var(--spacing-sm);
    }

    input[type="checkbox"] {
      margin-right: var(--spacing-sm);
      width: auto; // Override global input width: 100%
      display: inline-block; // Align checkbox with label text
    }
  }

  button { // Clear filters button
    // Inherit base button styles implicitly or explicitly if needed
    @extend button; // Extend the base button for padding, font, etc. if not inherited
    width: 100%;
    margin-top: var(--spacing-md);
    // Apply secondary button styles directly:
    background-color: transparent;
    border-color: var(--primary-color);
    color: var(--primary-color);

    &:hover, &:focus {
      background-color: rgba(52, 152, 219, 0.1); // Light primary background on hover
      opacity: 1;
      color: var(--primary-color); // Ensure text color remains on hover
      border-color: var(--primary-color); // Ensure border color remains on hover
    }
    // color: var(--primary-color);
    // &:hover { background-color: rgba(52, 152, 219, 0.1); }
  }
}

.main-content {
  // Styles for main area
}

.sorting-options {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  gap: var(--spacing-sm);

  label {
    font-weight: var(--font-weight-medium);
  }

  select {
    width: auto; // Don't take full width
    padding: var(--spacing-xs) var(--spacing-sm); // Smaller padding
  }
}

.product-grid-wrapper {
  min-height: 300px; // Prevent layout collapse while loading
}

.product-grid {
  display: grid;
  gap: var(--spacing-lg);
  // Responsive grid columns - adjust as needed for this context
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); // Slightly smaller min size

  // Example breakpoints (could differ from homepage)
  // @media (min-width: 576px) { grid-template-columns: repeat(2, 1fr); }
  // @media (min-width: 992px) { grid-template-columns: repeat(3, 1fr); }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: var(--border-width) solid var(--border-color);

  button {
    // Use base button styles
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: 0.9rem;

    &:disabled {
      background-color: var(--neutral-light);
      border-color: var(--neutral-light);
      cursor: not-allowed;
      opacity: 0.7;
    }
  }

  span {
    font-weight: var(--font-weight-medium);
  }

  p { // Total products text
    margin-left: var(--spacing-lg);
    font-size: 0.9rem;
    color: var(--text-color-light);
    margin-bottom: 0;
  }
}

// Loading/Empty states styling
p { // Basic styling for loading/empty messages
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-color-light);
}

```

# projects/storefront/src/app/category/category-page/category-page.component.spec.ts

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryPageComponent } from './category-page.component';

describe('CategoryPageComponent', () => {
  let component: CategoryPageComponent;
  let fixture: ComponentFixture<CategoryPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

# projects/storefront/src/app/category/category-page/category-page.component.ts

```ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category, Product } from '@shared-types';
import { ApiService } from '../../core/services/api.service';
import { StoreContextService } from '../../core/services/store-context.service'; // Import StoreContextService
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { Observable, switchMap, tap, map, BehaviorSubject, combineLatest, Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, RouterLink, Router, Params } from '@angular/router';

interface Filters {
  price_min?: number;
  price_max?: number;
  tags?: string[];
  // Add other potential filter properties here (e.g., color, size)
}

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ProductCardComponent
  ],
  templateUrl: './category-page.component.html',
  styleUrl: './category-page.component.scss'
})
export class CategoryPageComponent implements OnInit, OnDestroy {
  category$: Observable<Category | null> | undefined;
  products$: Observable<Product[]> | undefined;
  totalProducts$: Observable<number> | undefined;

  private filtersSubject = new BehaviorSubject<Filters>({});
  filters$ = this.filtersSubject.asObservable();

  // Made public for template binding
  sortSubject = new BehaviorSubject<string>('newest');
  sort$ = this.sortSubject.asObservable();

  // Made public for template binding
  pageSubject = new BehaviorSubject<number>(1);
  page$ = this.pageSubject.asObservable();

  itemsPerPage = 12;

  private destroy$ = new Subject<void>();
  currentStoreSlug$: Observable<string | null>; // Add slug observable

  // Properties to bind to filter inputs in the template
  selectedPriceRange: string = ''; // e.g., '0-20', '20-50'
  selectedTags: { [key: string]: boolean } = {}; // e.g., { 'New': true, 'Sale': false }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private storeContext: StoreContextService // Inject StoreContextService
  ) {
    this.currentStoreSlug$ = this.storeContext.currentStoreSlug$; // Assign slug observable
  }

  ngOnInit(): void {
    this.initializeFromQueryParams();

    const categoryId$ = this.route.paramMap.pipe(
      map(params => params.get('id')),
      tap(id => {
        if (!id) {
          this.router.navigate(['/']);
        }
      }),
      map(id => id!),
      takeUntil(this.destroy$)
    );

    this.category$ = categoryId$.pipe(
      switchMap(id => this.apiService.getCategoryDetails(id)),
      tap(category => {
        if (!category) {
          this.router.navigate(['/not-found']); // Or handle differently
        }
      }),
      takeUntil(this.destroy$)
    );

    const productResponse$ = combineLatest([
      categoryId$,
      this.filters$,
      this.sort$,
      this.page$
    ]).pipe(
      switchMap(([categoryId, filters, sort, page]) => {
        const params: any = {
          category_id: categoryId,
          sort: sort,
          page: page,
          limit: this.itemsPerPage,
          ...this.mapFiltersToApiParams(filters)
        };
        // Remove null/undefined params before sending
        Object.keys(params).forEach(key => (params[key] == null) && delete params[key]);
        return this.apiService.getProducts(params); // Expects { products: Product[], total: number }
      }),
      tap(() => this.updateUrlQueryParams()), // Update URL whenever params change
      takeUntil(this.destroy$)
    );

    this.products$ = productResponse$.pipe(map(response => response?.products || []));
    this.totalProducts$ = productResponse$.pipe(map(response => response?.total || 0));

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeFromQueryParams(): void {
    const queryParams = this.route.snapshot.queryParams;
    const initialFilters: Filters = {};
    if (queryParams['price_min']) initialFilters.price_min = +queryParams['price_min'];
    if (queryParams['price_max']) initialFilters.price_max = +queryParams['price_max'];
    if (queryParams['tags']) initialFilters.tags = queryParams['tags'].split(',');

    // Initialize local state for filter inputs based on query params
    this.selectedPriceRange = this.determinePriceRangeString(initialFilters.price_min, initialFilters.price_max);
    this.selectedTags = (initialFilters.tags || []).reduce((acc, tag) => {
      acc[tag] = true;
      return acc;
    }, {} as { [key: string]: boolean });


    this.filtersSubject.next(initialFilters);
    this.sortSubject.next(queryParams['sort'] || 'newest');
    this.pageSubject.next(queryParams['page'] ? +queryParams['page'] : 1);
  }

  determinePriceRangeString(min?: number, max?: number): string {
    if (min === undefined && max === undefined) return '';
    return `${min || 0}-${max || 'Infinity'}`; // Adjust representation as needed
  }

  applyFilters(): void {
    const newFilters: Filters = {};

    // Price Range Logic
    if (this.selectedPriceRange) {
      const parts = this.selectedPriceRange.split('-');
      if (parts.length === 2) {
        const min = parseInt(parts[0], 10);
        const max = parts[1] === 'Infinity' ? undefined : parseInt(parts[1], 10);
        if (!isNaN(min)) newFilters.price_min = min;
        if (max !== undefined && !isNaN(max)) newFilters.price_max = max;
      }
    }

    // Tags Logic
    const activeTags = Object.keys(this.selectedTags).filter(tag => this.selectedTags[tag]);
    if (activeTags.length > 0) {
      newFilters.tags = activeTags;
    }

    this.filtersSubject.next(newFilters);
    this.pageSubject.next(1); // Reset page on filter change
  }


  clearFilters(): void {
    this.selectedPriceRange = '';
    this.selectedTags = {};
    this.filtersSubject.next({});
    this.pageSubject.next(1);
  }

  onSortChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.sortSubject.next(selectElement.value);
    this.pageSubject.next(1);
  }

  onPageChange(page: number): void {
    this.pageSubject.next(page);
  }

  private mapFiltersToApiParams(filters: Filters): any {
    const apiParams: any = {};
    if (filters.price_min !== undefined) apiParams.price_min = filters.price_min;
    if (filters.price_max !== undefined) apiParams.price_max = filters.price_max;
    if (filters.tags && filters.tags.length > 0) apiParams.tags = filters.tags.join(',');
    return apiParams;
  }

  private updateUrlQueryParams(): void {
    const queryParams: Params = {};
    const currentFilters = this.filtersSubject.getValue();
    const currentSort = this.sortSubject.getValue();
    const currentPage = this.pageSubject.getValue();

    if (currentSort !== 'newest') {
      queryParams['sort'] = currentSort;
    }
    if (currentPage > 1) {
      queryParams['page'] = currentPage;
    }
    if (currentFilters.price_min !== undefined) {
      queryParams['price_min'] = currentFilters.price_min;
    }
    if (currentFilters.price_max !== undefined) {
      queryParams['price_max'] = currentFilters.price_max;
    }
    if (currentFilters.tags && currentFilters.tags.length > 0) {
      queryParams['tags'] = currentFilters.tags.join(',');
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  // Added method for pagination calculation
  calculateTotalPages(totalItems: number | null): number {
    if (!totalItems || totalItems <= 0) {
      return 1; // Or 0, depending on desired behavior for no items
    }
    return Math.ceil(totalItems / this.itemsPerPage);
  }
}

```

# projects/storefront/src/app/category/category-routing.module.ts

```ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoryPageComponent } from './category-page/category-page.component';

const routes: Routes = [
  { path: ':id', component: CategoryPageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CategoryRoutingModule { }

```

# projects/storefront/src/app/category/category.module.ts

```ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel

import { CategoryRoutingModule } from './category-routing.module';

import {  } from './category-page/category-page.component'; // Import the component

import { ProductCardComponent } from '../shared/components/product-card/product-card.component'; // Import standalone ProductCardComponent
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CategoryRoutingModule,
    FormsModule,
    ProductCardComponent
  ]
})
export class CategoryModule { }

```

# projects/storefront/src/app/contact/contact-page/contact-page.component.html

```html
<p>contact-page works!</p>

```

# projects/storefront/src/app/contact/contact-page/contact-page.component.scss

```scss

```

# projects/storefront/src/app/contact/contact-page/contact-page.component.spec.ts

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactPageComponent } from './contact-page.component';

describe('ContactPageComponent', () => {
  let component: ContactPageComponent;
  let fixture: ComponentFixture<ContactPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

# projects/storefront/src/app/contact/contact-page/contact-page.component.ts

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [],
  templateUrl: './contact-page.component.html',
  styleUrl: './contact-page.component.scss'
})
export class ContactPageComponent {

}

```

# projects/storefront/src/app/core/components/footer/footer.component.html

```html
<footer class="store-footer">
  <div class="footer-container">
    <!-- Newsletter Section -->
    <div class="footer-section newsletter-section">
      <h4>Subscribe to our Newsletter</h4>
      <app-newsletter-form></app-newsletter-form>
    </div>

    <!-- Quick Links Section (Example) -->
    <div class="footer-section links-section">
      <h4>Quick Links</h4>
      <ul *ngIf="currentStoreSlug$ | async as storeSlug"> <!-- Add *ngIf -->
        <li><a [routerLink]="['/', storeSlug, 'about']">About Us</a></li>
        <li><a [routerLink]="['/', storeSlug, 'contact']">Contact Us</a></li>
        <li><a [routerLink]="['/', storeSlug, 'faq']">FAQ</a></li>
        <li><a [routerLink]="['/', storeSlug, 'shipping']">Shipping Policy</a></li>
        <li><a [routerLink]="['/', storeSlug, 'returns']">Return Policy</a></li>
      </ul>
    </div>

    <!-- Social Media Section -->
    <div class="footer-section social-section">
      <h4>Follow Us</h4>
      <div class="social-links">
        <a href="#" target="_blank" title="Facebook"><span class="icon-facebook"></span></a> <!-- Placeholder -->
        <a href="#" target="_blank" title="Twitter"><span class="icon-twitter"></span></a>   <!-- Placeholder -->
        <a href="#" target="_blank" title="Instagram"><span class="icon-instagram"></span></a> <!-- Placeholder -->
        <!-- Add actual icons/images later -->
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <p>&copy; {{ currentYear }} Your Store Name. All Rights Reserved.</p>
  </div>
</footer>

```

# projects/storefront/src/app/core/components/footer/footer.component.scss

```scss
// Using global variables defined in src/styles.scss

:host {
  display: block;
  margin-top: var(--spacing-xxl); // Add space above the footer
}

.store-footer {
  background-color: var(--neutral-lightest); // Use a very light gray for footer background
  color: var(--text-color-light); // Use lighter text color in the footer
  padding-top: var(--spacing-xl);
  border-top: var(--border-width) solid var(--border-color);
}

.footer-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); // Responsive grid layout
  gap: var(--spacing-lg);

  // Apply container constraints
  width: 100%;
  max-width: var(--container-max-width);
  margin-right: auto;
  margin-left: auto;
  padding-right: var(--container-padding-x);
  padding-left: var(--container-padding-x);
  padding-bottom: var(--spacing-xl); // Padding at the bottom of the main content
}

.footer-section {
  h4 {
    font-size: 1.1rem; // Slightly smaller heading for footer sections
    font-weight: var(--font-weight-medium);
    color: var(--text-color); // Use primary text color for headings
    margin-bottom: var(--spacing-md);
  }
}

.links-section {
  ul {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      margin-bottom: var(--spacing-sm);

      a {
        color: var(--text-color-light); // Lighter link color
        text-decoration: none;

        &:hover,
        &:focus {
          color: var(--primary-color); // Highlight with primary color on hover
          text-decoration: underline;
          opacity: 1;
        }
      }
    }
  }
}

.social-section {
  .social-links {
    display: flex;
    gap: var(--spacing-md);

    a {
      color: var(--text-color-light);
      font-size: 24px; // Adjust if using icon fonts
      text-decoration: none;

      &:hover,
      &:focus {
        color: var(--primary-color);
        opacity: 1;
      }

      // Placeholder for actual icons - replace span content later
      span {
        display: inline-block; // Needed for potential icon library styling
        width: 24px; // Match font-size
        height: 24px; // Match font-size
        // Add background images or font-family if using icon fonts
        // Example: background-color: #ccc; // Placeholder visual
      }
    }
  }
}

.newsletter-section {
  // Styling for app-newsletter-form will be within its own component SCSS
  // Add any specific layout adjustments for this section if needed
}

.footer-bottom {
  background-color: var(--neutral-light); // Slightly darker background for the bottom bar
  padding: var(--spacing-md) var(--container-padding-x);
  text-align: center;
  margin-top: var(--spacing-lg); // Space between main footer content and bottom bar
  border-top: var(--border-width) solid var(--border-color);

  p {
    margin-bottom: 0; // Remove default paragraph margin
    font-size: 0.9rem;
    color: var(--text-color-light);
  }
}
```

# projects/storefront/src/app/core/components/footer/footer.component.ts

```ts
import { Component, inject } from '@angular/core'; // Import inject
import { CommonModule } from '@angular/common'; // May be needed for directives
import { StoreContextService } from '../../services/store-context.service'; // Import StoreContextService
import { Observable } from 'rxjs'; // Import Observable
import { RouterLink } from '@angular/router'; // For routerLink
import { NewsletterFormComponent } from '../../../shared/components/newsletter-form/newsletter-form.component'; // Import Newsletter Form

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NewsletterFormComponent // Add NewsletterFormComponent
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();
  private storeContext = inject(StoreContextService); // Inject StoreContextService
  currentStoreSlug$: Observable<string | null> = this.storeContext.currentStoreSlug$; // Expose slug observable
}

```

# projects/storefront/src/app/core/components/header/header.component.html

```html
<header class="store-header">
  <div class="header-container">
    <!-- Store Logo -->
    <div class="logo">
      <a [routerLink]="['/', currentStoreSlug$ | async]" *ngIf="currentStoreSlug$ | async as storeSlug"> <!-- Update logo link -->
        <!-- Placeholder for logo image -->
        <img src="/assets/images/logo-placeholder.png" alt="Store Logo" style="width: 150px;">
      </a>
    </div>

    <!-- Navigation -->
    <app-navigation class="navigation"></app-navigation>

    <!-- Right Section: Search, Account, Cart -->
    <div class="header-right">
      <app-search-bar class="search-bar"></app-search-bar>
      <div class="user-actions" *ngIf="currentStoreSlug$ | async as storeSlug">
        <!-- Show Account/Cart/Logout if authenticated -->
        <ng-container *ngIf="isAuthenticated$ | async; else loggedOutActions">
          <a [routerLink]="['/', storeSlug, 'account']" class="action-icon" title="My Account">
            <span class="material-icons">person</span>
          </a>
          <a [routerLink]="['/', storeSlug, 'cart']" class="action-icon" title="Shopping Cart">
            <span class="material-icons">shopping_cart</span>
            <span class="cart-count" *ngIf="cartItemCount > 0">{{ cartItemCount }}</span>
          </a>
          <button (click)="logout()" class="action-icon logout-button" title="Logout">
            <span class="material-icons">logout</span>
          </button>
        </ng-container>

        <!-- Show Login/Register if not authenticated -->
        <ng-template #loggedOutActions>
          <a [routerLink]="['/', storeSlug, 'login']" class="action-link" title="Login">Login</a>
          <a [routerLink]="['/', storeSlug, 'register']" class="action-link" title="Register">Register</a>
          <!-- Optionally show cart icon even when logged out -->
          <a [routerLink]="['/', storeSlug, 'cart']" class="action-icon" title="Shopping Cart">
            <span class="material-icons">shopping_cart</span>
            <span class="cart-count" *ngIf="cartItemCount > 0">{{ cartItemCount }}</span>
          </a>
        </ng-template>
      </div>
    </div>
  </div>
</header>

```

# projects/storefront/src/app/core/components/header/header.component.scss

```scss
// Using global variables defined in src/styles.scss

:host {
  display: block; // Ensure the component takes up block space
}

.store-header {
  background-color: var(--background-color);
  border-bottom: var(--border-width) solid var(--border-color);
  padding: var(--spacing-sm) 0; // Vertical padding, horizontal handled by container
  position: sticky; // Make header sticky
  top: 0;
  z-index: 1000; // Ensure it stays above other content
  box-shadow: var(--box-shadow-sm); // Subtle shadow for separation
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-lg); // Space between logo, nav, right section

  // Apply container constraints
  width: 100%;
  max-width: var(--container-max-width);
  margin-right: auto;
  margin-left: auto;
  padding-right: var(--container-padding-x);
  padding-left: var(--container-padding-x);
}

.logo {
  flex-shrink: 0; // Prevent logo from shrinking

  a {
    display: inline-block; // Ensures link wraps the image correctly
    line-height: 0; // Remove extra space below image if any
  }

  img {
    height: 40px; // Adjust height as needed, maintain aspect ratio
    width: auto; // Let width adjust automatically
    vertical-align: middle; // Align image nicely if there's text nearby
  }
}

.navigation {
  flex-grow: 1; // Allow navigation to take up available space
  display: flex;
  justify-content: center; // Center navigation links (adjust if needed)
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md); // Space between search and user actions
  flex-shrink: 0;
}

.search-bar {
  // Placeholder: Specific styling will be in search-bar.component.scss
  // Might need width constraints here depending on the search bar's internal styling
  max-width: 300px; // Example constraint
}

.user-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md); // Space between icons
}

.action-icon {
  color: var(--text-color); // Use default text color for icons
  text-decoration: none;
  position: relative; // For positioning the cart count badge
  display: flex; // Helps center the icon vertically if needed
  align-items: center;
  padding: var(--spacing-xs); // Small padding for better click area
  border-radius: 50%; // Make it circular on hover/focus

  &:hover,
  &:focus {
    color: var(--primary-color); // Change color on hover/focus
    background-color: var(--neutral-lightest); // Subtle background
    text-decoration: none; // Remove underline
    opacity: 1; // Override default link opacity hover
    outline: none; // Remove default focus outline if needed
  }

  .material-icons {
    font-size: 24px; // Standard icon size
    vertical-align: middle;
  }
}

.cart-count {
  position: absolute;
  top: -5px; // Adjust position relative to the icon
  right: -8px; // Adjust position relative to the icon
  background-color: var(--error-color); // Use error/alert color for emphasis
  color: white;
  font-size: 11px;
  font-weight: var(--font-weight-medium);
  border-radius: 50%;
  padding: 2px 5px;
  line-height: 1;
  min-width: 18px; // Ensure it's roughly circular even for single digits
  text-align: center;
}

// Responsive adjustments might be needed later
// e.g., hiding navigation behind a burger menu on smaller screens
```

# projects/storefront/src/app/core/components/header/header.component.ts

```ts
import { Component, OnInit, OnDestroy } from '@angular/core'; // Added OnInit, OnDestroy
import { CommonModule } from '@angular/common'; // For *ngIf
import { RouterLink } from '@angular/router'; // For routerLink directives
import { NavigationComponent } from '../navigation/navigation.component'; // Import Navigation
import { SearchBarComponent } from '../search-bar/search-bar.component'; // Import Search Bar
import { CartService } from '../../services/cart.service'; // Import CartService
import { StoreContextService } from '../../services/store-context.service'; // Import StoreContextService
import { AuthService } from '../../services/auth.service'; // Import AuthService
import { Observable, Subscription } from 'rxjs'; // Import Observable and Subscription
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NavigationComponent,
    SearchBarComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  cartItemCount$: Observable<number> | undefined;
  cartItemCount: number = 0; // For direct binding in template
  private cartCountSubscription: Subscription | undefined;
  currentStoreSlug$: Observable<string | null>; // Add slug observable
  isAuthenticated$: Observable<boolean>; // Add auth state observable

  // Inject CartService, StoreContextService, and AuthService
  constructor(
    private cartService: CartService,
    private storeContext: StoreContextService,
    private authService: AuthService // Inject AuthService
  ) {
    this.currentStoreSlug$ = this.storeContext.currentStoreSlug$; // Assign slug observable
    this.isAuthenticated$ = this.authService.isAuthenticated$; // Assign auth state observable
  }

  ngOnInit() {
    // Subscribe to the cart count observable
    this.cartItemCount$ = this.cartService.getItemCount();
    this.cartCountSubscription = this.cartItemCount$.subscribe(count => {
      this.cartItemCount = count;
      console.log('Cart count updated in header:', count); // For debugging
    });
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    if (this.cartCountSubscription) {
      this.cartCountSubscription.unsubscribe();
    }
  }

  logout(): void {
    this.authService.logout();
  }
}

```

# projects/storefront/src/app/core/components/navigation/navigation.component.html

```html
<nav class="main-navigation" *ngIf="currentStoreSlug$ | async as storeSlug">
  <ul>
    <li><a [routerLink]="['/', storeSlug]" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a></li>
    <li><a [routerLink]="['/', storeSlug, 'shop']" routerLinkActive="active">Shop</a></li>
    <li><a [routerLink]="['/', storeSlug, 'about']" routerLinkActive="active">About</a></li>
    <li><a [routerLink]="['/', storeSlug, 'contact']" routerLinkActive="active">Contact</a></li>
    <!-- Add other links as needed -->
  </ul>
</nav>

```

# projects/storefront/src/app/core/components/navigation/navigation.component.scss

```scss

```

# projects/storefront/src/app/core/components/navigation/navigation.component.ts

```ts
import { Component, inject } from '@angular/core';
import { StoreContextService } from '../../services/store-context.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent {
  private storeContext = inject(StoreContextService);
  currentStoreSlug$: Observable<string | null> = this.storeContext.currentStoreSlug$;
}

```

# projects/storefront/src/app/core/components/search-bar/search-bar.component.html

```html
<div class="search-container">
  <input type="text"
         placeholder="Search products..."
         class="search-input"
         [(ngModel)]="searchQuery"
         (input)="search(searchQuery)"
         (blur)="hideSuggestions()"> <!-- Hide suggestions when input loses focus -->

  <!-- Suggestions Dropdown -->
  <ul class="suggestions-list" *ngIf="showSuggestions && (searchResults$ | async) as results">
    <li *ngIf="results.length === 0 && searchQuery.length >= 3">No results found for "{{ searchQuery }}"</li>
    <li *ngFor="let product of results" (mousedown)="selectSuggestion(product)"> <!-- Use mousedown to register click before blur hides list -->
      <!-- Basic suggestion display - enhance as needed -->
      <a [routerLink]="['/product', product.id]"> <!-- Link to product page -->
        <img [src]="product.imageUrl || '/assets/images/placeholder.png'" alt="{{ product.name }}" class="suggestion-image">
        <span class="suggestion-name">{{ product.name }}</span>
        <span class="suggestion-price">{{ product.price | currency }}</span>
      </a>
    </li>
    <!-- Optional: Add loading indicator -->
  </ul>
</div>

```

# projects/storefront/src/app/core/components/search-bar/search-bar.component.scss

```scss
// Using global variables defined in src/styles.scss

:host {
  display: block;
  position: relative; // Needed for absolute positioning of the suggestions list
}

.search-container {
  position: relative; // Container for positioning
}

.search-input {
  // Inherits base input styles from global styles.scss
  // Add specific overrides or additions here if needed
  padding-right: calc(var(--spacing-md) * 2.5); // Make space for a potential search icon inside
  // Example: Add a subtle background
  // background-color: var(--neutral-lightest);
}

/* Optional: Add a search icon inside the input */
/*
.search-container::after {
  content: 'search'; // Material Icons ligature
  font-family: 'Material Icons';
  position: absolute;
  right: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-color-light);
  pointer-events: none; // Don't interfere with input clicks
  font-size: 20px;
}
*/

.suggestions-list {
  position: absolute;
  top: calc(100% + var(--spacing-xs)); // Position below the input with a small gap
  left: 0;
  right: 0;
  background-color: var(--background-color);
  border: var(--border-width) solid var(--border-color);
  border-top: none; // Avoid double border with input focus ring
  border-radius: 0 0 var(--border-radius-md) var(--border-radius-md); // Rounded bottom corners
  list-style: none;
  padding: 0;
  margin: 0;
  z-index: 1010; // Ensure it's above header but potentially below modals
  max-height: 300px; // Limit height and allow scrolling
  overflow-y: auto;
  box-shadow: var(--box-shadow-md);

  li {
    padding: var(--spacing-sm) var(--spacing-md);
    cursor: pointer;
    border-bottom: var(--border-width) solid var(--neutral-lightest); // Separator line

    &:last-child {
      border-bottom: none;
    }

    // Style for "No results found" message
    &:first-child:last-child { // If it's the only item
      color: var(--text-color-light);
      font-style: italic;
      cursor: default;
    }

    a {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      text-decoration: none;
      color: var(--text-color); // Reset link color inside suggestions

      &:hover,
      &:focus {
        text-decoration: none; // No underline needed here
        opacity: 1;
      }
    }

    &:hover,
    &:focus-within { // Highlight on hover or when link inside is focused
      background-color: var(--neutral-lightest);
    }
  }
}

.suggestion-image {
  width: 40px;
  height: 40px;
  object-fit: cover; // Scale image nicely
  border-radius: var(--border-radius-sm);
  flex-shrink: 0;
}

.suggestion-name {
  flex-grow: 1; // Take available space
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; // Prevent long names from breaking layout
}

.suggestion-price {
  font-size: 0.9rem;
  color: var(--text-color-light);
  white-space: nowrap;
  margin-left: var(--spacing-sm);
}

```

# projects/storefront/src/app/core/components/search-bar/search-bar.component.ts

```ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { RouterLink } from '@angular/router'; // For linking suggestions
import { ApiService } from '../../services/api.service'; // Import ApiService
import { Product } from '@shared-types';
import { Subject, Observable, of } from 'rxjs';
import {
  debounceTime, distinctUntilChanged, switchMap, catchError
} from 'rxjs/operators';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // Add FormsModule
    RouterLink   // Add RouterLink
  ],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss'
})
export class SearchBarComponent implements OnInit {
  searchQuery: string = '';
  searchResults$: Observable<Product[]> | undefined;
  showSuggestions: boolean = false;

  private searchTerms = new Subject<string>();

  constructor(private apiService: ApiService) {}

  // Push a search term into the observable stream.
  search(term: string): void {
    // Only search if term is long enough (as per plan)
    if (term.length >= 3) {
      this.searchTerms.next(term);
      this.showSuggestions = true;
    } else {
      this.searchResults$ = of([]); // Clear results if term is too short
      this.showSuggestions = false;
    }
  }

  ngOnInit(): void {
    this.searchResults$ = this.searchTerms.pipe(
      // Wait 500ms after each keystroke before considering the term (as per plan)
      debounceTime(500),

      // Ignore new term if same as previous term
      distinctUntilChanged(),

      // Switch to new search observable each time the term changes
      switchMap((term: string) => this.apiService.searchProducts(term)),

      // Handle errors, e.g., return empty array
      catchError(error => {
        console.error('Search API error:', error);
        this.showSuggestions = false;
        return of([]); // Return empty array on error
      })
    );
  }

  // Method to hide suggestions when input loses focus (with a small delay)
  hideSuggestions(): void {
    // Use setTimeout to allow clicking on a suggestion link before hiding
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200); // Adjust delay as needed
  }

  // Optional: Method to handle selecting a suggestion (e.g., navigate to product)
  selectSuggestion(product: Product): void {
    // Example: Navigate to product page or clear search
    console.log('Selected:', product);
    this.searchQuery = ''; // Clear search bar
    this.showSuggestions = false;
    // this.router.navigate(['/product', product.id]); // Requires Router injection
  }
}


```

# projects/storefront/src/app/core/core.module.ts

```ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class CoreModule { }

```

# projects/storefront/src/app/core/guards/auth.guard.ts

```ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Import AuthService
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Use the isAuthenticated$ observable from AuthService
  return authService.isAuthenticated$.pipe(
    take(1), // Take the current value and complete
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true; // Allow access if authenticated
      } else {
        // Redirect to login page if not authenticated
        console.log('AuthGuard: User not authenticated, redirecting to store-specific login.');
        // Extract storeSlug from the state.url (e.g., /store-slug/account/overview -> store-slug)
        const urlSegments = state.url.split('/');
        const storeSlug = urlSegments.length > 1 ? urlSegments[1] : null; // Get the first segment after the initial '/'

        if (storeSlug) {
          // Redirect to the store-specific login page
          router.navigate(['/', storeSlug, 'login'], { queryParams: { returnUrl: state.url } });
        } else {
          // Fallback if storeSlug cannot be determined (should not happen with current routing)
          console.error('AuthGuard: Could not determine storeSlug from URL:', state.url);
          router.navigate(['/login']); // Redirect to a generic login or error page?
        }
        return false; // Block access
      }
    })
  );
};

```

# projects/storefront/src/app/core/interceptors/auth.interceptor.ts

```ts
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service'; // Import AuthService

// Functional Interceptor
export const authInterceptor: HttpInterceptorFn = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
  ): Observable<HttpEvent<unknown>> => {

  const authService = inject(AuthService); // Inject AuthService using inject()
  const authToken = authService.getToken();
  let clonedRequest = req; // Start with the original request

  // Clone the request and add the authorization header if token exists
  // Don't add the header for login/register requests or external APIs
  if (authToken && req.url.startsWith('/api/')) { // Only add for our API calls
    // Avoid adding auth header to login/register itself if they are under /api/auth
    if (!req.url.includes('/api/auth/login') && !req.url.includes('/api/auth/register')) {
      clonedRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`
        }
      });
    }
  }

  return next(clonedRequest); // Pass the potentially cloned request to the next handler
};

```

# projects/storefront/src/app/core/services/api.service.ts

```ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, switchMap, take } from 'rxjs'; // Import switchMap and take
import { Category, Product } from '@shared-types'; // Import shared interfaces
import { StoreContextService } from './store-context.service'; // Import StoreContextService
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private storeContext = inject(StoreContextService); // Inject StoreContextService
  private apiUrl = '/api'; // Assuming API is proxied or on the same domain

  constructor() {} // Keep constructor if needed for other DI, otherwise remove if only using inject()

  getFeaturedCategories(): Observable<Category[]> {
    return this.storeContext.currentStoreSlug$.pipe(
      take(1), // Take the current value and complete
      switchMap(storeSlug => {
        let params = new HttpParams();
        if (storeSlug) {
          params = params.set('storeSlug', storeSlug);
        }
        return this.http.get<Category[]>(`${this.apiUrl}/categories/featured`, { params });
      })
    );
  }

  getFeaturedProducts(): Observable<Product[]> {
    return this.storeContext.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        let params = new HttpParams();
        if (storeSlug) {
          params = params.set('storeSlug', storeSlug);
        }
        return this.http.get<Product[]>(`${this.apiUrl}/products/featured`, { params });
      })
    );
  }

  getCategoryDetails(categoryId: string): Observable<Category | null> {
    return this.storeContext.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        let params = new HttpParams();
        if (storeSlug) {
          params = params.set('storeSlug', storeSlug);
        }
        // Consider adding catchError operator if specific handling is needed.
        return this.http.get<Category>(`${this.apiUrl}/categories/${categoryId}`, { params });
      })
    );
  }

  // Method to fetch products, potentially filtered, sorted, and paginated
  getProducts(queryParams: any): Observable<{ products: Product[], total: number }> {
    return this.storeContext.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        let httpParams = new HttpParams();
        // Add storeSlug first
        if (storeSlug) {
          httpParams = httpParams.set('storeSlug', storeSlug);
        }
        // Build HttpParams from the queryParams object
        Object.keys(queryParams).forEach(key => {
          if (queryParams[key] !== undefined && queryParams[key] !== null) {
            httpParams = httpParams.set(key, queryParams[key].toString());
          }
        });
        // Assuming the API returns an object like { products: Product[], total: number }
        return this.http.get<{ products: Product[], total: number }>(`${this.apiUrl}/products`, { params: httpParams });
      })
    );
  }

  // Method for product search
  searchProducts(query: string): Observable<Product[]> {
    return this.storeContext.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        let params = new HttpParams().set('q', query);
        if (storeSlug) {
          params = params.set('storeSlug', storeSlug);
        }
        // Assuming the backend search endpoint is /api/search or maybe /api/products?q=...
        // Let's assume /api/products for now, consistent with getProducts
        return this.http.get<Product[]>(`${this.apiUrl}/products`, { params });
      })
    );
  }

  // Method to fetch details for a single product
  getProductDetails(productId: string): Observable<Product> {
    return this.storeContext.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        let params = new HttpParams();
        if (storeSlug) {
          params = params.set('storeSlug', storeSlug);
        }
        // Assuming API returns 404 if not found, handled by HttpClient
        return this.http.get<Product>(`${this.apiUrl}/products/${productId}`, { params });
      })
    );
  }

  // Method to add item to cart
  addToCart(payload: { productId: string, quantity: number }): Observable<any> { // Assuming API returns new cart state or success
    // The backend endpoint might be POST /api/cart/add as per plan
    return this.http.post(`${this.apiUrl}/cart/add`, payload);
  }

  // Method for newsletter subscription
  subscribeNewsletter(email: string): Observable<any> { // Assuming API returns simple success/error
    // The backend endpoint might be POST /api/newsletter/subscribe as per plan
    return this.http.post(`${this.apiUrl}/newsletter/subscribe`, { email });
  }

  // --- Cart Methods ---

  getCart(): Observable<any> { // Define a proper Cart interface later
    return this.http.get(`${this.apiUrl}/cart`);
  }

  updateCartItemQuantity(productId: string, quantity: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/cart/${productId}`, { quantity });
  }

  removeCartItem(productId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cart/${productId}`);
  }

  // --- Auth Methods ---

  register(userData: any): Observable<any> { // Use a proper DTO type later if needed on frontend
    return this.http.post(`${this.apiUrl}/auth/register`, userData);
  }

  // Add login method later
}


```

# projects/storefront/src/app/core/services/auth.service.ts

```ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from '@shared-types';

// Define interfaces for API responses if not already in shared-types
interface AuthResponse {
  access_token: string;
  user?: Omit<User, 'passwordHash'>;
  message?: string;
}

interface RegisterResponse {
  message: string;
  user: Omit<User, 'passwordHash'>;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authApiUrl = '/api/auth';
  private accountApiUrl = '/api/account';
  private tokenKey = 'authToken';

  // BehaviorSubject to track authentication status
  private _isAuthenticated = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this._isAuthenticated.asObservable();

  // BehaviorSubject to store user info (optional, could fetch profile separately)
  private _currentUser = new BehaviorSubject<Omit<User, 'passwordHash'> | null>(null);
  public currentUser$ = this._currentUser.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Optionally load user profile if token exists on init
    if (this.hasToken()) { this.loadUserProfile().subscribe(); }
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  private storeToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this._isAuthenticated.next(true);
  }

  private removeToken(): void {
    localStorage.removeItem(this.tokenKey);
    this._isAuthenticated.next(false);
    this._currentUser.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authApiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.access_token) {
          this.storeToken(response.access_token);
          // Fetch profile after successful login
          this.loadUserProfile().subscribe();
          // Get current storeSlug for redirection
          const storeSlug = this.route.snapshot.firstChild?.params['storeSlug'];
          if (storeSlug) {
            this.router.navigate(['/', storeSlug, 'account']);
          } else {
            console.error('AuthService: Could not determine storeSlug for redirect after login.');
            // Fallback? Maybe redirect to root or a generic error page?
            this.router.navigate(['/']); // Redirect to root as fallback
          }
        }
      }),
      catchError(this.handleError)
    );
  }

  register(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'roles' | 'passwordHash'> & {password: string}): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.authApiUrl}/register`, userData).pipe(
      tap(response => {
        // Optionally auto-login or just show success message
        console.log('Registration successful:', response.message);
        // Maybe navigate to login page: this.router.navigate(['/login']);
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    this.removeToken();
    // Get current storeSlug for redirection
    // Need to get it asynchronously as logout might be called from anywhere
    // Use the root route's first child to find the component with the slug
    let currentRoute = this.router.routerState.root;
    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
    }
    const storeSlug = currentRoute.snapshot.params['storeSlug'];

    if (storeSlug) {
      this.router.navigate(['/', storeSlug, 'login']); // Redirect to store-specific login page
    } else {
      console.error('AuthService: Could not determine storeSlug for redirect after logout.');
      // Fallback? Maybe redirect to root or a generic error page?
      this.router.navigate(['/']); // Redirect to root as fallback
    }
  }

  // Basic error handler
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.error?.message || error.statusText}`;
      if (error.status === 401) {
        errorMessage = 'Invalid credentials. Please try again.';
      }
      // Add more specific error handling based on status codes if needed
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage)); // Return an observable error
  }

  // Method to load user profile using the stored token
  loadUserProfile(): Observable<Omit<User, 'passwordHash'>> {
    // Assumes a /api/account/profile endpoint protected by JwtAuthGuard
    return this.http.get<Omit<User, 'passwordHash'>>(`${this.accountApiUrl}/profile`).pipe(
      tap(user => this._currentUser.next(user)), // Store user data on success
      catchError(error => {
        // If profile fetch fails (e.g., token expired, unauthorized), log out
        console.error('Failed to load user profile:', error);
        this.logout(); // Call logout which now handles redirection correctly
        return throwError(() => new Error('Failed to load user profile. Please log in again.'));
      })
    );
  }

  // Helper to get current user synchronously (use with caution, prefer observable)
  getCurrentUserSnapshot(): Omit<User, 'passwordHash'> | null {
    return this._currentUser.getValue();
  }
}

```

# projects/storefront/src/app/core/services/cart.service.ts

```ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, throwError, map, first } from 'rxjs'; // Added first
import { Product } from '@shared-types';
import { ApiService } from './api.service';
// Removed incorrect NestJS Logger import

// Interface for items in the cart (might evolve)
export interface CartItem {
  product: Product;
  quantity: number;
}

// Interface for the cart state
export interface CartState {
  items: CartItem[];
  totalItems: number;
  // Add total price, etc. later
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Removed NestJS logger instance
  // Use BehaviorSubject to hold and emit cart state
  private cartStateSubject = new BehaviorSubject<CartState>({ items: [], totalItems: 0 });
  cartState$ = this.cartStateSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.loadInitialCart();
  }

  private loadInitialCart(): void {
    this.apiService.getCart().pipe(
      first(), // Take the first emission
      tap(response => {
        // Assuming response is { cart: { [productId: string]: number } }
        this._updateStateFromBackendCart(response.cart || {});
        console.log('Initial cart loaded'); // Replaced logger
      }),
      catchError(error => {
        console.error('Error loading initial cart:', error); // Replaced logger
        // Initialize with empty cart on error
        this.cartStateSubject.next({ items: [], totalItems: 0 });
        return throwError(() => new Error('Failed to load cart'));
      })
    ).subscribe();
  }

  // Observable for just the total item count (for header)
  getItemCount(): Observable<number> {
    return this.cartState$.pipe(map(state => state.totalItems));
  }

  // Add item to cart
  addItem(product: Product, quantity: number = 1): Observable<any> {
    const payload = { productId: product.id, quantity };
    console.log(`CartService: Adding item ${payload.productId} qty ${payload.quantity}`); // Replaced logger

    return this.apiService.addToCart(payload).pipe(
      tap((response) => {
        // Assuming response is { success: boolean, message: string, cart: { [productId: string]: number } }
        if (response.success) {
          this._updateStateFromBackendCart(response.cart || {});
          console.log(`Item added successfully. New state updated.`); // Replaced logger
        } else {
          console.warn(`Failed to add item via API: ${response.message}`); // Replaced logger
          // Optionally re-sync state if API failed but local state was optimistic
          // this.loadInitialCart(); // Or handle more gracefully
        }
      }),
      catchError(error => {
        console.error('Error adding item to cart:', error); // Replaced logger
        // TODO: Add user-facing error handling
        return throwError(() => new Error('Failed to add item to cart'));
      })
    );
  }

  updateItemQuantity(productId: string, quantity: number): Observable<any> {
     console.log(`CartService: Updating item ${productId} qty ${quantity}`); // Replaced logger
     return this.apiService.updateCartItemQuantity(productId, quantity).pipe(
       tap((response) => {
         if (response.success) {
           this._updateStateFromBackendCart(response.cart || {});
           console.log(`Item quantity updated successfully.`); // Replaced logger
         } else {
           console.warn(`Failed to update quantity via API: ${response.message}`); // Replaced logger
         }
       }),
       catchError(error => {
         console.error('Error updating item quantity:', error); // Replaced logger
         return throwError(() => new Error('Failed to update item quantity'));
       })
     );
   }

   removeItem(productId: string): Observable<any> {
     console.log(`CartService: Removing item ${productId}`); // Replaced logger
     return this.apiService.removeCartItem(productId).pipe(
       tap((response) => {
         if (response.success) {
           this._updateStateFromBackendCart(response.cart || {});
           console.log(`Item removed successfully.`); // Replaced logger
         } else {
           console.warn(`Failed to remove item via API: ${response.message}`); // Replaced logger
         }
       }),
       catchError(error => {
         console.error('Error removing item from cart:', error); // Replaced logger
         return throwError(() => new Error('Failed to remove item from cart'));
       })
     );
   }

  // Helper to update local state from the backend's simple cart structure
  private _updateStateFromBackendCart(backendCart: { [productId: string]: number }): void {
    let totalItems = 0;
    const newItems: CartItem[] = [];

    for (const productId in backendCart) {
      if (backendCart.hasOwnProperty(productId)) {
        const quantity = backendCart[productId];
        totalItems += quantity;
        // Create partial CartItem - missing full product details!
        newItems.push({
          product: { id: productId } as Product, // Cast as Product, but only ID is known
          quantity: quantity
        });
      }
    }

    this.cartStateSubject.next({ items: newItems, totalItems: totalItems });
    console.log('Cart state updated from backend response:', this.cartStateSubject.getValue()); // Replaced logger
  }

}

```

# projects/storefront/src/app/core/services/store-context.service.ts

```ts
import { Injectable, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, switchMap } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root' // Provided globally
})
export class StoreContextService {
  // Use BehaviorSubject to hold the current store slug and allow components to subscribe
  private currentStoreSlugSubject = new BehaviorSubject<string | null>(null);
  public currentStoreSlug$: Observable<string | null> = this.currentStoreSlugSubject.asObservable();

  // Alternatively, use a signal for simpler state management in newer Angular versions
  // public currentStoreSlug = signal<string | null>(null);

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        // Traverse the route tree to find the activated route snapshot containing the slug
        let route = this.activatedRoute.firstChild;
        let slug: string | null = null;
        while (route) {
          if (route.snapshot.paramMap.has('storeSlug')) {
            slug = route.snapshot.paramMap.get('storeSlug');
            break; // Found the slug
          }
          route = route.firstChild;
        }
        return slug;
      })
    ).subscribe(slug => {
      if (slug !== this.currentStoreSlugSubject.value) {
        this.currentStoreSlugSubject.next(slug);
        // If using signal: this.currentStoreSlug.set(slug);
        // console.log('Store Slug Context Updated:', slug); // For debugging
      }
    });
  }

  // Helper method to get the current slug synchronously if needed (use with caution)
  getCurrentStoreSlug(): string | null {
    return this.currentStoreSlugSubject.value;
    // If using signal: return this.currentStoreSlug();
  }
}
```

# projects/storefront/src/app/faq/faq-page/faq-page.component.html

```html
<p>faq-page works!</p>

```

# projects/storefront/src/app/faq/faq-page/faq-page.component.scss

```scss

```

# projects/storefront/src/app/faq/faq-page/faq-page.component.spec.ts

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqPageComponent } from './faq-page.component';

describe('FaqPageComponent', () => {
  let component: FaqPageComponent;
  let fixture: ComponentFixture<FaqPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaqPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

# projects/storefront/src/app/faq/faq-page/faq-page.component.ts

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-faq-page',
  standalone: true,
  imports: [],
  templateUrl: './faq-page.component.html',
  styleUrl: './faq-page.component.scss'
})
export class FaqPageComponent {

}

```

# projects/storefront/src/app/home/components/carousel/carousel.component.html

```html
<div class="carousel-container"
     (mouseenter)="stopAutoPlay()"
     (mouseleave)="startAutoPlay()">

  <!-- Slides -->
  <div class="slides-wrapper">
    <div class="slide"
         *ngFor="let slide of slides; let i = index"
         [ngClass]="{'active': i === currentSlideIndex}">
      <a *ngIf="slide.linkUrl; else noLink" [href]="slide.linkUrl" target="_blank" rel="noopener noreferrer">
        <img [src]="slide.imageUrl" [alt]="slide.altText">
      </a>
      <ng-template #noLink>
        <img [src]="slide.imageUrl" [alt]="slide.altText">
      </ng-template>
      <!-- Optional: Add text overlays or calls to action here -->
    </div>
  </div>

  <!-- Navigation Arrows -->
  <button class="carousel-control prev" (click)="prevSlide()">&#10094;</button>
  <button class="carousel-control next" (click)="nextSlide()">&#10095;</button>

  <!-- Indicators (Dots) -->
  <div class="carousel-indicators">
    <span *ngFor="let slide of slides; let i = index"
          class="indicator-dot"
          [ngClass]="{'active': i === currentSlideIndex}"
          (click)="selectSlide(i)">
    </span>
  </div>

</div>

```

# projects/storefront/src/app/home/components/carousel/carousel.component.scss

```scss
// Using global variables defined in src/styles.scss

:host {
  display: block;
}

.carousel-container {
  position: relative;
  overflow: hidden; // Hide parts of slides that are outside the container
  width: 100%;
  // aspect-ratio: 16 / 6; // Example aspect ratio, adjust as needed for banner images
  min-height: 300px; // Minimum height to prevent collapse before images load
  background-color: var(--neutral-lightest); // Placeholder background
  border-radius: var(--border-radius-lg); // Optional: Rounded corners for the carousel
}

.slides-wrapper {
  display: flex;
  transition: transform 0.5s ease-in-out; // Slide transition effect
  height: 100%; // Ensure wrapper takes full height
}

.slide {
  min-width: 100%;
  flex-shrink: 0;
  opacity: 0; // Start hidden
  transition: opacity 0.5s ease-in-out;
  position: relative; // For potential text overlays
  height: 100%; // Ensure slide takes full height

  &.active {
    opacity: 1; // Show active slide
  }

  a, img {
    display: block;
    width: 100%;
    height: 100%; // Make image fill the slide area
    object-fit: cover; // Cover the area, may crop image
    // object-fit: contain; // Contain image within area, may leave gaps
  }

  // Optional: Styling for text overlays
  /*
  .slide-content {
    position: absolute;
    bottom: var(--spacing-xl);
    left: var(--spacing-xl);
    color: white;
    background-color: rgba(0, 0, 0, 0.5);
    padding: var(--spacing-md);
    border-radius: var(--border-radius-md);
  }
  */
}

.carousel-control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.4); // Semi-transparent background
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  z-index: 10; // Above slides
  border-radius: 50%; // Circular buttons
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  line-height: 1;
  transition: background-color 0.2s ease;

  &:hover, &:focus {
    background-color: rgba(0, 0, 0, 0.7);
    outline: none;
  }

  &.prev {
    left: var(--spacing-md);
  }

  &.next {
    right: var(--spacing-md);
  }
}

.carousel-indicators {
  position: absolute;
  bottom: var(--spacing-md);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: var(--spacing-sm);
  z-index: 10; // Above slides
}

.indicator-dot {
  width: 10px;
  height: 10px;
  background-color: rgba(255, 255, 255, 0.5); // Semi-transparent white dots
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.8);
  }

  &.active {
    background-color: white; // Solid white for active dot
  }
}

```

# projects/storefront/src/app/home/components/carousel/carousel.component.ts

```ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { interval, Subscription } from 'rxjs';

interface CarouselSlide {
  imageUrl: string;
  altText: string;
  linkUrl?: string; // Optional link for the slide
}

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule], // Add CommonModule here
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss'
})
export class CarouselComponent implements OnInit, OnDestroy {
  // Mock slide data - replace with dynamic data later if needed
  slides: CarouselSlide[] = [
    { imageUrl: '/assets/images/carousel-1.jpg', altText: 'Promotion 1' },
    { imageUrl: '/assets/images/carousel-2.jpg', altText: 'Promotion 2' },
    { imageUrl: '/assets/images/carousel-3.jpg', altText: 'Promotion 3' },
  ];

  currentSlideIndex = 0;
  private autoPlaySubscription: Subscription | null = null;
  private readonly autoPlayIntervalMs = 5000; // 5 seconds as per plan

  ngOnInit(): void {
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  startAutoPlay(): void {
    this.stopAutoPlay(); // Ensure no duplicate intervals
    if (this.slides.length > 1) {
      this.autoPlaySubscription = interval(this.autoPlayIntervalMs).subscribe(() => {
        this.nextSlide();
      });
    }
  }

  stopAutoPlay(): void {
    if (this.autoPlaySubscription) {
      this.autoPlaySubscription.unsubscribe();
      this.autoPlaySubscription = null;
    }
  }

  selectSlide(index: number): void {
    this.currentSlideIndex = index;
    this.startAutoPlay(); // Restart timer on manual interaction
  }

  prevSlide(): void {
    const isFirstSlide = this.currentSlideIndex === 0;
    this.currentSlideIndex = isFirstSlide ? this.slides.length - 1 : this.currentSlideIndex - 1;
    this.startAutoPlay(); // Restart timer
  }

  nextSlide(): void {
    const isLastSlide = this.currentSlideIndex === this.slides.length - 1;
    this.currentSlideIndex = isLastSlide ? 0 : this.currentSlideIndex + 1;
    this.startAutoPlay(); // Restart timer
  }
}

```

# projects/storefront/src/app/home/home-routing.module.ts

```ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';

const routes: Routes = [
  {
    path: '', // Default route for the home module
    component: HomepageComponent,
  },
  // Add other routes specific to the home module here if needed later
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}

```

# projects/storefront/src/app/home/home.module.ts

```ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module'; // Import routing module
import { HomepageComponent } from './homepage/homepage.component'; // Import component

// Import Standalone Components used by HomepageComponent
import { CarouselComponent } from './components/carousel/carousel.component';
import { CategoryCardComponent } from '../shared/components/category-card/category-card.component';
import { ProductCardComponent } from '../shared/components/product-card/product-card.component';
import { SearchBarComponent } from '../core/components/search-bar/search-bar.component'; // Assuming SearchBar is needed on homepage, though plan puts it in header
import { NewsletterFormComponent } from '../shared/components/newsletter-form/newsletter-form.component'; // Assuming Newsletter is needed on homepage, though plan puts it in footer

@NgModule({
  declarations: [HomepageComponent], // Declare the component
  imports: [
    CommonModule,
    HomeRoutingModule, // Import routing module
    // Import standalone components needed by HomepageComponent template
    CarouselComponent,
    CategoryCardComponent,
    ProductCardComponent,
    SearchBarComponent, // Re-evaluate if needed directly here vs. header/footer
    NewsletterFormComponent, // Re-evaluate if needed directly here vs. header/footer
  ],
})
export class HomeModule {}

```

# projects/storefront/src/app/home/homepage/homepage.component.html

```html
<!-- Hero Banner Carousel -->
<section class="hero-carousel">
  <app-carousel></app-carousel>
</section>

<!-- Featured Categories -->
<section class="featured-categories container">
  <h2>Featured Categories</h2>
  <div class="category-grid" *ngIf="featuredCategories$ | async as categories">
    <app-category-card
      *ngFor="let category of categories"
      [category]="category"
      [storeSlug]="currentStoreSlug$ | async"
    ></app-category-card>
  </div>
  <!-- Add loading/error state handling later -->
</section>

<!-- Featured Products -->
<section class="featured-products container">
  <h2>Featured Products</h2>
  <div class="product-grid" *ngIf="featuredProducts$ | async as products">
    <app-product-card
      *ngFor="let product of products"
      [product]="product"
      [storeSlug]="currentStoreSlug$ | async"
    ></app-product-card>
  </div>
</section>

<!-- Newsletter Signup - Note: Plan puts this in the footer, handled by app-footer -->
<!-- Search Bar - Note: Plan puts this in the header, handled by app-header -->

```

# projects/storefront/src/app/home/homepage/homepage.component.scss

```scss
// Using global variables defined in src/styles.scss

:host {
  display: block; // Ensure component takes up block space
}

// Add vertical spacing between homepage sections
.hero-carousel,
.featured-categories,
.featured-products {
  margin-bottom: var(--spacing-xxl); // Add significant space below each section (e.g., 48px)
}

// Specific adjustments for sections if needed

.featured-categories,
.featured-products {
  // The .container class is applied in the HTML, handling horizontal padding/max-width
  h2 {
    text-align: center; // Center the section titles
    margin-bottom: var(--spacing-xl); // Add space below the title (e.g., 32px)
  }
}

// Grid layout for categories and products
.category-grid,
.product-grid {
  display: grid;
  gap: var(--spacing-lg); // Gap between cards (e.g., 24px)

  // Responsive grid columns
  // Start with 1 column on smallest screens
  grid-template-columns: 1fr;

  // Example: 2 columns on small screens and up
  @media (min-width: 576px) {
    grid-template-columns: repeat(2, 1fr);
  }

  // Example: 3 columns on medium screens and up
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }

  // Example: 4 columns on large screens and up (adjust as needed)
  @media (min-width: 992px) {
    grid-template-columns: repeat(4, 1fr);
  }
}

// Ensure cards within the grid don't have extra bottom margin if they have it internally
.category-grid > *,
.product-grid > * {
  margin-bottom: 0;
}

```

# projects/storefront/src/app/home/homepage/homepage.component.ts

```ts
import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Category, Product } from '@shared-types';
import { ApiService } from '../../core/services/api.service';
import { StoreContextService } from '../../core/services/store-context.service';
@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss',
})
export class HomepageComponent {
  private apiService = inject(ApiService);
  private storeContext = inject(StoreContextService);
  featuredCategories$: Observable<Category[]>;
  featuredProducts$: Observable<Product[]>;
  currentStoreSlug$: Observable<string | null> = this.storeContext.currentStoreSlug$;

  constructor() {
    this.featuredCategories$ = this.apiService.getFeaturedCategories();
    this.featuredProducts$ = this.apiService.getFeaturedProducts();
  }
}

```

# projects/storefront/src/app/login-page/login-page.component.html

```html
<div class="login-container">
  <h2>Login</h2>
  <p>Welcome back! Please enter your details.</p>

  <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate>
    <div class="form-group">
      <label for="email">Email Address</label>
      <input
        type="email"
        id="email"
        formControlName="email"
        placeholder="Enter your email"
        [ngClass]="{ 'is-invalid': email?.invalid && (email?.dirty || email?.touched) }"
      />
      <div *ngIf="email?.invalid && (email?.dirty || email?.touched)" class="invalid-feedback">
        <div *ngIf="email?.errors?.['required']">Email is required.</div>
        <div *ngIf="email?.errors?.['email']">Please enter a valid email address.</div>
      </div>
    </div>

    <div class="form-group password-group">
      <label for="password">Password</label>
      <div class="input-wrapper">
        <input
          [type]="passwordFieldType"
          id="password"
          formControlName="password"
          placeholder="Enter your password"
          [ngClass]="{ 'is-invalid': password?.invalid && (password?.dirty || password?.touched) }"
        />
        <button type="button" class="toggle-password" (click)="togglePasswordVisibility()">
          <!-- Use an icon font (like Font Awesome) or text -->
          {{ passwordFieldType === 'password' ? 'Show' : 'Hide' }}
        </button>
      </div>
      <div *ngIf="password?.invalid && (password?.dirty || password?.touched)" class="invalid-feedback">
        <div *ngIf="password?.errors?.['required']">Password is required.</div>
        <div *ngIf="password?.errors?.['minlength']">Password must be at least 8 characters long.</div>
      </div>
    </div>

    <div class="form-group form-check-inline">
       <input type="checkbox" id="rememberMe" formControlName="rememberMe" class="form-check-input">
       <label for="rememberMe" class="form-check-label">Remember me</label>
       <a routerLink="/forgot-password" class="forgot-password-link">Forgot Password?</a> <!-- Add routerLink later -->
    </div>

    <div *ngIf="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <button type="submit" class="btn btn-primary" [disabled]="loginForm.invalid || isSubmitting">
      {{ isSubmitting ? 'Logging in...' : 'Login' }}
    </button>
  </form>

  <div class="register-link">
    Don't have an account? <a routerLink="../register">Sign up</a>
  </div>
</div>

```

# projects/storefront/src/app/login-page/login-page.component.scss

```scss
@import '../../styles/_variables.scss';

.login-container {
  max-width: 450px;
  margin: 4rem auto;
  padding: 2rem;
  border: 1px solid $border-color;
  border-radius: $border-radius-md;
  background-color: $white;
  box-shadow: $box-shadow-sm;

  h2 {
    text-align: center;
    margin-bottom: 0.5rem;
    color: $primary-color;
  }

  p {
    text-align: center;
    margin-bottom: 2rem;
    color: $text-muted;
  }

  .form-group {
    margin-bottom: 1.5rem;

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: $text-color;
    }

    // Specific styling for password input group
    &.password-group {
      .input-wrapper {
        position: relative;
        display: flex;
        align-items: center;

        input[type="password"],
        input[type="text"] {
          padding-right: 4rem;
        }

        .toggle-password {
          position: absolute;
          right: 0.5rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: $text-muted;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          font-size: 0.9em;

          &:hover {
            color: $primary-color;
          }
        }
      }
    }


    input[type="email"],
    input[type="password"],
    input[type="text"] {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid $border-color;
      border-radius: $border-radius-sm;
      font-size: 1rem;
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;

      &:focus {
        border-color: $primary-color-light;
        outline: 0;
        box-shadow: 0 0 0 0.2rem rgba($primary-color, 0.25);
      }

      &.is-invalid {
        border-color: $error-color;
        &:focus {
          box-shadow: 0 0 0 0.2rem rgba($error-color, 0.25);
        }
      }
    }

    .invalid-feedback {
      color: $error-color;
      font-size: 0.875em;
      margin-top: 0.25rem;
    }

    // Styling for Remember Me / Forgot Password row
    &.form-check-inline {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;

      .form-check-input {
        margin-right: 0.5rem;
        cursor: pointer;
      }

      .form-check-label {
        margin-bottom: 0;
        font-weight: normal;
        color: $text-muted;
        cursor: pointer;
        user-select: none;
      }

      .forgot-password-link {
        font-size: 0.9rem;
        color: $primary-color;
        text-decoration: none;
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }

  .error-message {
    color: $error-color;
    background-color: rgba($error-color, 0.1);
    border: 1px solid rgba($error-color, 0.2);
    padding: 0.75rem 1rem;
    border-radius: $border-radius-sm;
    margin-bottom: 1.5rem;
    text-align: center;
    font-size: 0.9rem;
  }

  .btn-primary {
    width: 100%;
    padding: 0.8rem 1rem;
    font-size: 1rem;
    font-weight: 600;
    background-color: $primary-color;
    border-color: $primary-color;
    color: $white;
    border-radius: $border-radius-sm;
    cursor: pointer;
    transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out;

    &:hover {
      background-color: darken($primary-color, 10%);
      border-color: darken($primary-color, 10%);
    }

    &:disabled {
      background-color: lighten($primary-color, 20%);
      border-color: lighten($primary-color, 20%);
      cursor: not-allowed;
      opacity: 0.65;
    }
  }

  .register-link {
    text-align: center;
    margin-top: 1.5rem;
    color: $text-muted;
    font-size: 0.9rem;

    a {
      color: $primary-color;
      font-weight: 500;
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  }
}
```

# projects/storefront/src/app/login-page/login-page.component.ts

```ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // Import RouterModule for routerLink
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../core/services/auth.service'; // Import AuthService

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule], // Import necessary modules
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {
  loginForm!: FormGroup; // Use definite assignment assertion
  isSubmitting = false;
  errorMessage: string | null = null;
  passwordFieldType: 'password' | 'text' = 'password'; // Property for password field type

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false] // Add rememberMe form control, default to false
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // Mark fields as touched to show errors
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: () => {
        // Navigation is handled within the AuthService on success
        console.log('Login successful');
      },
      error: (error) => {
        this.errorMessage = error.message || 'Login failed. Please check your credentials.';
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  // Helper getters for template validation access
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
  get rememberMe() { return this.loginForm.get('rememberMe'); } // Getter for rememberMe

  // Method to toggle password visibility
  togglePasswordVisibility(): void {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }
}

```

# projects/storefront/src/app/product/product-page/product-page.component.html

```html
<!-- Wait for product data -->
<div class="product-page-container" *ngIf="product$ | async as product; else loadingProduct">

  <!-- Breadcrumbs (Example - Needs category data if available) -->
  <div class="breadcrumbs">
    <a [routerLink]="['/']">Home</a>
    <!-- Add category link if product data includes it -->
    <!-- > <a [routerLink]="['/category', product.categoryId]">{{ product.categoryName }}</a> -->
    > <span>{{ product.name }}</span>
  </div>

  <div class="product-details-grid">
    <!-- Left Section: Image -->
    <div class="product-image-section">
      <!-- Basic image display - Carousel/Zoom later -->
      <img [src]="product.imageUrl || '/assets/images/placeholder.png'" [alt]="product.name" class="main-product-image">
      <!-- Thumbnails would go here -->
    </div>

    <!-- Right Section: Info & Actions -->
    <div class="product-info-section">
      <h1 class="product-name">{{ product.name }}</h1>

      <!-- Price - Style based on global vars -->
      <p class="product-price">{{ product.price | currency }}</p>

      <!-- Average Rating Placeholder -->
      <div class="product-rating">
        <!-- Add star rating display later -->
        <span>⭐⭐⭐⭐⭐ (Placeholder)</span>
      </div>

      <!-- Description -->
      <div class="product-description">
        <p>{{ product.description || 'No description available.' }}</p>
        <!-- Add formatted text/bullets later -->
      </div>

      <!-- Variant Selection Placeholder -->
      <div class="product-variants">
        <!-- Add dropdowns for Size, Color etc. later -->
        <p>(Variant selection placeholder)</p>
      </div>

      <!-- Quantity & Add to Cart -->
      <div class="product-actions">
        <div class="quantity-selector">
          <label for="quantity">Quantity:</label>
          <!-- Basic number input - Add +/- buttons later -->
          <input type="number" id="quantity" [(ngModel)]="quantity" min="1" step="1" class="quantity-input">
        </div>
        <button class="add-to-cart-btn" (click)="onAddToCart(product)">Add to Cart</button>
        <!-- Add Wishlist button later -->
      </div>

      <!-- Shipping/Return Info Placeholder -->
      <div class="product-meta-info">
        <p>(Shipping/Return info placeholder)</p>
      </div>
    </div>
  </div>

  <!-- Lower Sections: Details, Reviews, Related -->
  <div class="product-lower-sections">
    <!-- Add Tabs/Sections for Specs, Reviews, Related Products later -->
    <p>(Detailed Specs / Reviews / Related Products placeholder)</p>
  </div>

</div>

<!-- Loading Template -->
<ng-template #loadingProduct>
  <p>Loading product details...</p>
</ng-template>

```

# projects/storefront/src/app/product/product-page/product-page.component.scss

```scss
// Using global variables defined in src/styles.scss

:host {
  display: block;
}

.product-page-container {
  // Use the global container for max-width and padding
  width: 100%;
  max-width: var(--container-max-width);
  margin: var(--spacing-xl) auto; // Add vertical margin
  padding: 0 var(--container-padding-x);
}

.breadcrumbs {
  margin-bottom: var(--spacing-lg);
  font-size: 0.9rem;
  color: var(--text-color-light);

  a {
    color: var(--text-color-light);
    &:hover {
      color: var(--primary-color);
    }
  }

  span {
    font-weight: var(--font-weight-medium);
    color: var(--text-color);
  }
}

.product-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr; // 50% / 50% split
  gap: var(--spacing-xxl); // Generous gap between image and info
  margin-bottom: var(--spacing-xxl);

  @media (max-width: 768px) { // Stack on smaller screens
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }
}

.product-image-section {
  // Styles for image area
  .main-product-image {
    width: 100%;
    max-width: 500px; // Max width as per plan
    height: auto;
    aspect-ratio: 1 / 1; // Maintain square aspect ratio
    object-fit: cover;
    border: var(--border-width) solid var(--border-color);
    border-radius: var(--border-radius-lg);
    background-color: var(--neutral-lightest); // Placeholder background
  }
  // Add styles for thumbnails later
}

.product-info-section {
  // Styles for info area
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md); // Spacing between info elements

  .product-name {
    font-size: 2rem; // Larger heading for product name
    margin-bottom: 0; // Adjust spacing via gap
  }

  .product-price {
    font-size: 1.8rem; // Prominent price
    font-weight: var(--font-weight-bold);
    color: var(--primary-color); // Highlight color
    margin-bottom: var(--spacing-sm);
  }

  .product-rating {
    // Add styles for star display later
    margin-bottom: var(--spacing-md);
    color: var(--text-color-light);
  }

  .product-description {
    line-height: var(--line-height-base);
    color: var(--text-color-light);
  }

  .product-variants,
  .product-meta-info {
    font-size: 0.9rem;
    color: var(--text-color-light);
    margin-top: var(--spacing-sm);
  }

  .product-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    margin-top: var(--spacing-lg);
    flex-wrap: wrap; // Allow wrapping on small screens

    .quantity-selector {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);

      label {
        font-weight: var(--font-weight-medium);
      }

      .quantity-input {
        width: 70px; // Fixed width for quantity input
        text-align: center;
        padding: var(--spacing-xs) var(--spacing-sm);
      }
    }

    .add-to-cart-btn {
      // Inherits base button styles
      flex-grow: 1; // Allow button to take space
      min-width: 150px; // Minimum width
      padding: var(--spacing-md) var(--spacing-lg); // Larger padding for primary action
      font-size: 1.1rem;
    }
  }
}

.product-lower-sections {
  margin-top: var(--spacing-xxl);
  padding-top: var(--spacing-xl);
  border-top: var(--border-width) solid var(--border-color);
  // Add styles for tabs/accordions later
}

// Loading state styling
p {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-color-light);
}
```

# projects/storefront/src/app/product/product-page/product-page.component.spec.ts

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductPageComponent } from './product-page.component';

describe('ProductPageComponent', () => {
  let component: ProductPageComponent;
  let fixture: ComponentFixture<ProductPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

# projects/storefront/src/app/product/product-page/product-page.component.ts

```ts
import { Component, OnInit, inject } from '@angular/core'; // Added OnInit, inject
import { CommonModule } from '@angular/common'; // For *ngIf, async pipe etc.
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // For reading route params, navigation, breadcrumbs
import { FormsModule } from '@angular/forms'; // For quantity input [(ngModel)]
import { Observable, switchMap, tap, map } from 'rxjs';
import { Product } from '@shared-types';
import { ApiService } from '../../core/services/api.service';
import { CartService } from '../../core/services/cart.service'; // Import CartService

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, // For breadcrumbs routerLink
    FormsModule   // For quantity ngModel
  ],
  templateUrl: './product-page.component.html',
  styleUrl: './product-page.component.scss'
})
export class ProductPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private cartService = inject(CartService); // Inject CartService

  product$: Observable<Product | null> | undefined;
  quantity: number = 1; // Default quantity

  ngOnInit(): void {
    this.product$ = this.route.paramMap.pipe(
      map(params => params.get('id')),
      tap(id => {
        if (!id) {
          console.error('Product ID missing from route');
          this.router.navigate(['/']); // Redirect if no ID
        }
      }),
      switchMap(id => {
        if (!id) {
          return new Observable<Product | null>(subscriber => subscriber.next(null)); // Return null observable if no ID
        }
        return this.apiService.getProductDetails(id).pipe(
          tap(product => {
            if (!product) {
              console.error(`Product with ID ${id} not found`);
              this.router.navigate(['/not-found']); // Redirect if product not found
            }
          })
        );
      })
    );
  }

  // Method to handle adding to cart
  onAddToCart(product: Product | null): void {
    if (!product) {
      console.error('Cannot add null product to cart');
      return;
    }
    if (this.quantity < 1) {
      console.warn('Quantity must be at least 1');
      this.quantity = 1; // Reset quantity if invalid
      // Optionally show user feedback
      return;
    }
    console.log(`Adding ${this.quantity} of ${product.name} to cart`);
    this.cartService.addItem(product, this.quantity).subscribe({
      next: () => {
        console.log('Item added successfully via service');
        // TODO: Add user feedback (e.g., toast notification, button state change)
      },
      error: (err) => {
        console.error('Failed to add item via service:', err);
        // TODO: Add user feedback
      }
    });
  }

  // TODO: Add methods for variant selection, quantity adjustment limits based on stock, etc.
}

```

# projects/storefront/src/app/product/product-routing.module.ts

```ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductPageComponent } from './product-page/product-page.component';

const routes: Routes = [
  {
    path: ':id', // Matches '/product/:id' because the parent route is 'product'
    component: ProductPageComponent
  },
  // Optional: Add a default route for '/product' if needed
  // { path: '', redirectTo: '/some-default-product-list', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductRoutingModule { }
```

# projects/storefront/src/app/product/product.module.ts

```ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductRoutingModule } from './product-routing.module'; // Import routing module
import { ProductPageComponent } from './product-page/product-page.component'; // Import component


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ProductRoutingModule // Import the routing module
  ]
})
export class ProductModule { }

```

# projects/storefront/src/app/registration-page/registration-page.component.html

```html
<div class="registration-container">
      <h1>Create Account</h1>

      <form [formGroup]="registrationForm" (ngSubmit)="onSubmit()" novalidate>

        <!-- Success Message -->
        <div *ngIf="successMessage" class="alert alert-success">
          {{ successMessage }}
        </div>

        <!-- Error Message -->
        <div *ngIf="errorMessage" class="alert alert-danger">
          {{ errorMessage }}
        </div>

        <!-- First Name -->
        <div class="form-group">
          <label for="firstName">First Name</label>
          <input type="text" id="firstName" formControlName="firstName"
                 [ngClass]="{ 'is-invalid': firstName?.invalid && (firstName?.dirty || firstName?.touched) }">
          <div *ngIf="firstName?.invalid && (firstName?.dirty || firstName?.touched)" class="invalid-feedback">
            <div *ngIf="firstName?.errors?.['required']">First name is required.</div>
            <div *ngIf="firstName?.errors?.['maxlength']">First name cannot exceed 50 characters.</div>
          </div>
        </div>

        <!-- Last Name -->
        <div class="form-group">
          <label for="lastName">Last Name</label>
          <input type="text" id="lastName" formControlName="lastName"
                 [ngClass]="{ 'is-invalid': lastName?.invalid && (lastName?.dirty || lastName?.touched) }">
          <div *ngIf="lastName?.invalid && (lastName?.dirty || lastName?.touched)" class="invalid-feedback">
            <div *ngIf="lastName?.errors?.['required']">Last name is required.</div>
            <div *ngIf="lastName?.errors?.['maxlength']">Last name cannot exceed 50 characters.</div>
          </div>
        </div>

        <!-- Email -->
        <div class="form-group">
          <label for="email">Email Address</label>
          <input type="email" id="email" formControlName="email"
                 [ngClass]="{ 'is-invalid': email?.invalid && (email?.dirty || email?.touched) }">
          <div *ngIf="email?.invalid && (email?.dirty || email?.touched)" class="invalid-feedback">
            <div *ngIf="email?.errors?.['required']">Email is required.</div>
            <div *ngIf="email?.errors?.['email']">Please enter a valid email address.</div>
            <div *ngIf="email?.errors?.['maxlength']">Email cannot exceed 100 characters.</div>
            <div *ngIf="email?.errors?.['emailExists']">This email address is already registered.</div>
          </div>
        </div>

        <!-- Password -->
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" formControlName="password"
                 [ngClass]="{ 'is-invalid': password?.invalid && (password?.dirty || password?.touched) }">
          <div *ngIf="password?.invalid && (password?.dirty || password?.touched)" class="invalid-feedback">
            <div *ngIf="password?.errors?.['required']">Password is required.</div>
            <div *ngIf="password?.errors?.['minlength']">Password must be at least 8 characters long.</div>
            <div *ngIf="password?.errors?.['maxlength']">Password cannot exceed 100 characters.</div>
            <div *ngIf="password?.errors?.['pattern']">Password requires uppercase, lowercase, number, and special character.</div>
          </div>
          <!-- Placeholder for Password Strength Meter -->
          <div class="password-strength-meter">
            <!-- Implement strength visualization later (e.g., using a library or custom component) -->
            Strength: [ Placeholder ]
          </div>
          <ul class="password-requirements">
            <li>At least 8 characters</li>
            <li>Uppercase & lowercase letters</li>
            <li>At least one number</li>
            <li>At least one special character (&#64;$!%*?&)</li>
          </ul>
        </div>

        <!-- Confirm Password -->
        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input type="password" id="confirmPassword" formControlName="confirmPassword"
                 [ngClass]="{ 'is-invalid': (confirmPassword?.invalid || registrationForm.hasError('passwordMismatch')) && (confirmPassword?.dirty || confirmPassword?.touched) }">
          <div *ngIf="(confirmPassword?.invalid || registrationForm.hasError('passwordMismatch')) && (confirmPassword?.dirty || confirmPassword?.touched)" class="invalid-feedback">
            <div *ngIf="confirmPassword?.errors?.['required']">Please confirm your password.</div>
            <div *ngIf="registrationForm.hasError('passwordMismatch') && !confirmPassword?.errors?.['required']">Passwords do not match.</div>
          </div>
        </div>

        <!-- Phone (Optional) -->
        <div class="form-group">
          <label for="phone">Phone Number (Optional)</label>
          <input type="tel" id="phone" formControlName="phone"
                 [ngClass]="{ 'is-invalid': phone?.invalid && (phone?.dirty || phone?.touched) }">
          <div *ngIf="phone?.invalid && (phone?.dirty || phone?.touched)" class="invalid-feedback">
             <div *ngIf="phone?.errors?.['pattern']">Please enter a valid phone number.</div>
             <div *ngIf="phone?.errors?.['maxlength']">Phone number cannot exceed 20 characters.</div>
          </div>
        </div>

        <!-- Newsletter Opt-in -->
        <div class="form-group form-check">
          <input type="checkbox" id="newsletterOptIn" formControlName="newsletterOptIn" class="form-check-input">
          <label for="newsletterOptIn" class="form-check-label">Sign up for our newsletter</label>
        </div>

        <!-- Terms and Conditions -->
        <div class="form-group form-check">
          <input type="checkbox" id="terms" formControlName="terms" class="form-check-input"
                 [ngClass]="{ 'is-invalid': terms?.invalid && (terms?.dirty || terms?.touched || submitted) }">
          <label for="terms" class="form-check-label">
            I agree to the <a href="/terms-and-conditions" target="_blank">Terms and Conditions</a> <!-- Link to actual terms page later -->
          </label>
          <div *ngIf="terms?.invalid && (terms?.dirty || terms?.touched || submitted)" class="invalid-feedback">
            You must agree to the terms and conditions.
          </div>
        </div>

        <button type="submit" class="submit-btn" [disabled]="isSubmitting">
          {{ isSubmitting ? 'Registering...' : 'Create Account' }}
        </button>

      </form>

      <div class="login-link">
        Already have an account? <a [routerLink]="['../login']">Log In</a> <!-- Use relative path -->
      </div>
    </div>

```

# projects/storefront/src/app/registration-page/registration-page.component.scss

```scss
// Using global variables defined in src/styles.scss

:host {
  display: flex;
  justify-content: center;
  align-items: flex-start; // Align to top
  padding: var(--spacing-xxl) var(--container-padding-x);
  min-height: 70vh; // Ensure it takes up significant height
}

.registration-container {
  width: 100%;
  max-width: 500px; // Limit form width
  padding: var(--spacing-xl);
  background-color: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow-md);

  h1 {
    text-align: center;
    margin-bottom: var(--spacing-xl);
    font-size: 1.8rem;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md); // Space between form groups

    .form-group {
      label {
        display: block;
        margin-bottom: var(--spacing-xs);
        font-weight: var(--font-weight-medium);
      }

      input[type="text"],
      input[type="email"],
      input[type="password"],
      input[type="tel"] {
        // Inherits base styles from global styles.scss
        width: 100%; // Ensure full width within container
      }

      // Styling for invalid inputs
      input.is-invalid {
        border-color: var(--error-color);
        &:focus {
          box-shadow: 0 0 0 0.2rem rgba(231, 76, 60, 0.25); // Red focus ring
        }
      }

      .invalid-feedback {
        color: var(--error-color);
        font-size: 0.85rem;
        margin-top: var(--spacing-xs);
      }

      // Password requirements list styling (nested within form-group)
      .password-requirements {
        font-size: 0.8rem;
        color: var(--text-color-light);
        list-style: disc;
        padding-left: 1.5rem; // Indent list items
        margin-top: var(--spacing-xs);
        margin-bottom: 0; // Reset default margin
      }

      // Placeholder styling for strength meter (nested within form-group)
      .password-strength-meter {
        font-size: 0.8rem;
        color: var(--text-color-light);
        margin-top: var(--spacing-xs);
        // Add more specific styles when implemented
      }
    } // End of .form-group

    // Styling for checkbox groups (direct child of form)
    .form-check {
      display: flex;
      align-items: center;
      margin-bottom: var(--spacing-sm); // Smaller margin for checkboxes

      .form-check-input {
        margin-right: var(--spacing-sm);
        cursor: pointer;
        // Use browser default or apply custom styles if needed

        &.is-invalid {
           // Add specific invalid style if needed, e.g., outline
           outline: 1px solid var(--error-color);
        }
      }

      .form-check-label {
        margin-bottom: 0; // Align label vertically
        font-weight: normal; // Normal weight for checkbox labels
        cursor: pointer;
        user-select: none;

        a { // Style link within label (e.g., Terms)
          color: var(--primary-color);
          text-decoration: none;
          &:hover {
            text-decoration: underline;
          }
        }
      }

      // Need to target the invalid-feedback *after* the form-check div
      // This assumes the invalid-feedback div is placed immediately after the form-check div in the HTML
      + .invalid-feedback {
         color: var(--error-color);
         font-size: 0.85rem;
         margin-top: var(--spacing-xs);
         display: block; // Ensure it shows
      }
    } // End of .form-check

    .alert {
      padding: var(--spacing-md);
      margin-bottom: var(--spacing-md);
      border: 1px solid transparent;
      border-radius: var(--border-radius-md);
      text-align: center;

      &.alert-success {
        color: #0f5132;
        background-color: #d1e7dd;
        border-color: #badbcc;
      }

      &.alert-danger {
        color: #842029;
        background-color: #f8d7da;
        border-color: #f5c2c7;
      }
    } // End of .alert

    .submit-btn {
      // Inherits base button styles
      margin-top: var(--spacing-md);
      padding: var(--spacing-md) var(--spacing-lg);
      font-size: 1.1rem;

      &:disabled {
        background-color: var(--neutral-medium);
        border-color: var(--neutral-medium);
        cursor: not-allowed;
      }
    } // End of .submit-btn

  } // End of form

  .login-link {
    text-align: center;
    margin-top: var(--spacing-lg);
    font-size: 0.9rem;
    color: var(--text-color-light);

    a {
      font-weight: var(--font-weight-medium);
      color: var(--primary-color);
      &:hover {
        text-decoration: underline;
      }
    }
  } // End of .login-link

} // End of .registration-container
```

# projects/storefront/src/app/registration-page/registration-page.component.spec.ts

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationPageComponent } from './registration-page.component';

describe('RegistrationPageComponent', () => {
  let component: RegistrationPageComponent;
  let fixture: ComponentFixture<RegistrationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

# projects/storefront/src/app/registration-page/registration-page.component.ts

```ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // For *ngIf
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms'; // Use ReactiveFormsModule
import { Router, RouterModule } from '@angular/router'; // For navigation and routerLink
import { ApiService } from '../core/services/api.service'; // Import ApiService
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-registration-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // Import ReactiveFormsModule
    RouterModule // For login link
  ],
  templateUrl: './registration-page.component.html',
  styleUrl: './registration-page.component.scss'
})
export class RegistrationPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private router = inject(Router);

  registrationForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(100),
      // Removed pattern validation
    ]],
    confirmPassword: ['', [Validators.required]],
    // Use regex matching backend for Israeli numbers (05X-XXXXXXX or 0X-XXXXXXX)
    phone: ['', [Validators.pattern(/^0\d{1,2}-?\d{7}$/), Validators.maxLength(20)]],
    newsletterOptIn: [false], // Re-add newsletter opt-in control
    terms: [false, Validators.requiredTrue] // Re-add terms control, required
  }, { validators: this.passwordMatchValidator });

  isSubmitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  submitted = false; // Flag to track submission attempt

  ngOnInit(): void {}

  // Custom validator function
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else if (confirmPassword?.hasError('passwordMismatch')) {
       // Clear error if they now match or password changes
       confirmPassword.setErrors(null);
    }
    return null;
  }


  onSubmit(): void {
    this.submitted = true; // Set submitted flag on attempt
    this.errorMessage = null;
    this.successMessage = null;
    this.registrationForm.markAllAsTouched(); // Mark all fields as touched to show errors

    if (this.registrationForm.invalid || this.isSubmitting) {
      console.log('Form Invalid:', this.registrationForm.errors);
      // Find specific errors
       Object.keys(this.registrationForm.controls).forEach(key => {
         const controlErrors = this.registrationForm.get(key)?.errors;
         if (controlErrors != null) {
           console.log('Key control: ' + key + ', errors: ' + JSON.stringify(controlErrors));
         }
       });
      return;
    }

    this.isSubmitting = true;

    // Exclude only confirmPassword before sending
    // We now *want* newsletterOptIn and terms included in formData
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...formData } = this.registrationForm.value;

    this.apiService.register(formData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = response.message || 'Registration successful! Please log in.';
        console.log('Registration successful:', response);
        // Optionally clear form or redirect after a delay
        this.registrationForm.reset();
        // setTimeout(() => this.router.navigate(['/login']), 2000); // Redirect to login later
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting = false;
        if (error.status === 409) { // Conflict - email likely exists
          this.errorMessage = error.error?.message || 'Email address is already registered.';
          this.registrationForm.get('email')?.setErrors({ emailExists: true });
        } else {
          this.errorMessage = error.error?.message || 'An unexpected error occurred during registration. Please try again.';
        }
        console.error('Registration failed:', error);
      }
    });
  }

  // Helper getters for template validation
  get firstName() { return this.registrationForm.get('firstName'); }
  get lastName() { return this.registrationForm.get('lastName'); }
  get email() { return this.registrationForm.get('email'); }
  get password() { return this.registrationForm.get('password'); }
  get confirmPassword() { return this.registrationForm.get('confirmPassword'); }
  get phone() { return this.registrationForm.get('phone'); }
  get newsletterOptIn() { return this.registrationForm.get('newsletterOptIn'); } // Re-add getter
  get terms() { return this.registrationForm.get('terms'); } // Re-add getter
}

```

# projects/storefront/src/app/return-policy/return-policy-page/return-policy-page.component.html

```html
<p>return-policy-page works!</p>

```

# projects/storefront/src/app/return-policy/return-policy-page/return-policy-page.component.scss

```scss

```

# projects/storefront/src/app/return-policy/return-policy-page/return-policy-page.component.spec.ts

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnPolicyPageComponent } from './return-policy-page.component';

describe('ReturnPolicyPageComponent', () => {
  let component: ReturnPolicyPageComponent;
  let fixture: ComponentFixture<ReturnPolicyPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnPolicyPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReturnPolicyPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

# projects/storefront/src/app/return-policy/return-policy-page/return-policy-page.component.ts

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-return-policy-page',
  standalone: true,
  imports: [],
  templateUrl: './return-policy-page.component.html',
  styleUrl: './return-policy-page.component.scss'
})
export class ReturnPolicyPageComponent {

}

```

# projects/storefront/src/app/shared/components/category-card/category-card.component.html

```html
<!-- Structure based on plan: Link, Image, Name -->
<!-- Make the link conditional, but display content regardless -->
<a *ngIf="category" [routerLink]="storeSlug ? ['/', storeSlug, 'category', category.id] : null" class="category-card-link" [title]="category.name">
  <div class="category-card">
    <div class="category-image-wrapper">
      <!-- Use category image or placeholder -->
      <img [src]="category.imageUrl || '/assets/images/category-placeholder.png'"
           [alt]="category.name"
           class="category-image"
           loading="lazy">
    </div>
    <h5 class="category-name">{{ category.name }}</h5>
  </div>
</a>

```

# projects/storefront/src/app/shared/components/category-card/category-card.component.scss

```scss
// Using global variables defined in src/styles.scss

:host {
  display: block; // Ensure the component takes up block space
  // The grid layout in homepage.component.scss handles sizing/spacing
}

.category-card-link {
  display: block;
  text-decoration: none;
  color: inherit; // Inherit text color from parent
  border-radius: var(--border-radius-lg); // Rounded corners for the whole card link
  overflow: hidden; // Clip content like image zoom effect
  transition: var(--transition-base);
  box-shadow: var(--box-shadow-sm); // Subtle shadow for depth

  &:hover,
  &:focus {
    text-decoration: none;
    box-shadow: var(--box-shadow-md); // Slightly larger shadow on hover/focus
    transform: translateY(-2px); // Subtle lift effect
  }

  &:focus {
    outline: 2px solid var(--primary-color); // Focus outline
    outline-offset: 2px;
  }
}

.category-card {
  background-color: var(--background-color);
  // Dimensions based on plan (approximate via aspect ratio or fixed height)
  // Let the grid define width, control height via aspect-ratio or fixed value
  // height: 200px; // Fixed height as per plan
  aspect-ratio: 3 / 2; // 300x200 ratio
  display: flex;
  flex-direction: column;
}

.category-image-wrapper {
  overflow: hidden; // Hide image overflow if needed
  position: relative;
  flex-grow: 1; // Allow image area to take up most space
  background-color: var(--neutral-lightest); // Placeholder background
}

.category-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover; // Cover the area, cropping if necessary
  transition: transform 0.3s ease; // Zoom effect on hover

  .category-card-link:hover &,
  .category-card-link:focus & {
    transform: scale(1.05); // Slight zoom effect
  }
}

.category-name {
  padding: var(--spacing-sm) var(--spacing-md); // Padding around the name
  text-align: center;
  font-size: 1.1rem;
  font-weight: var(--font-weight-medium);
  color: var(--text-color);
  background-color: var(--background-color); // Ensure background covers image edge
  margin: 0; // Reset heading margin
  white-space: nowrap; // Prevent wrapping
  overflow: hidden;
  text-overflow: ellipsis; // Add ellipsis if name is too long
}
```

# projects/storefront/src/app/shared/components/category-card/category-card.component.ts

```ts
import { Component, Input } from '@angular/core';
import { Category } from '@shared-types';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category-card.component.html',
  styleUrl: './category-card.component.scss'
})
export class CategoryCardComponent {

  @Input() category!: Category;
  @Input() storeSlug: string | null = null;
}

```

# projects/storefront/src/app/shared/components/newsletter-form/newsletter-form.component.html

```html
<form #newsletterForm="ngForm" (ngSubmit)="onSubmit(newsletterForm)" class="newsletter-form">
  <div class="form-group">
    <label for="newsletter-email" class="sr-only">Email address</label>
    <input type="email"
           id="newsletter-email"
           name="email"
           placeholder="Enter your email address"
           [(ngModel)]="email"
           required
           email #emailInput="ngModel"
           [disabled]="isSubmitting">
    <button type="submit" [disabled]="newsletterForm.invalid || isSubmitting">
      {{ isSubmitting ? 'Subscribing...' : 'Subscribe' }}
    </button>
  </div>
  <div *ngIf="emailInput.invalid && (emailInput.dirty || emailInput.touched)" class="error-message">
    <span *ngIf="emailInput.errors?.['required']">Email is required.</span>
    <span *ngIf="emailInput.errors?.['email']">Please enter a valid email address.</span>
  </div>
  <div *ngIf="message" class="feedback-message" [ngClass]="{'success': isSuccess, 'error': !isSuccess}">
    {{ message }}
  </div>
</form>

```

# projects/storefront/src/app/shared/components/newsletter-form/newsletter-form.component.scss

```scss

```

# projects/storefront/src/app/shared/components/newsletter-form/newsletter-form.component.spec.ts

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsletterFormComponent } from './newsletter-form.component';

describe('NewsletterFormComponent', () => {
  let component: NewsletterFormComponent;
  let fixture: ComponentFixture<NewsletterFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsletterFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsletterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

# projects/storefront/src/app/shared/components/newsletter-form/newsletter-form.component.ts

```ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms'; // Import FormsModule and NgForm
import { ApiService } from '../../../core/services/api.service'; // Adjust path if needed

@Component({
  selector: 'app-newsletter-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule // Add FormsModule
  ],
  templateUrl: './newsletter-form.component.html',
  styleUrl: './newsletter-form.component.scss'
})
export class NewsletterFormComponent {
  email: string = '';
  message: string = ''; // For success/error feedback
  isSubmitting: boolean = false;
  isSuccess: boolean = false;

  constructor(private apiService: ApiService) {}

  onSubmit(form: NgForm): void {
    if (form.invalid || !this.email) {
      this.message = 'Please enter a valid email address.';
      this.isSuccess = false;
      return;
    }

    this.isSubmitting = true;
    this.message = ''; // Clear previous messages

    this.apiService.subscribeNewsletter(this.email).subscribe({
      next: (response) => {
        console.log('Subscription successful:', response);
        this.message = 'Thank you for subscribing!';
        this.isSuccess = true;
        this.email = ''; // Clear input on success
        form.resetForm(); // Reset form state
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Subscription error:', error);
        // Provide a user-friendly error message
        this.message = error.error?.message || 'Subscription failed. Please try again later.';
        this.isSuccess = false;
        this.isSubmitting = false;
      }
    });
  }
}


```

# projects/storefront/src/app/shared/components/product-card/product-card.component.html

```html
<div class="product-card" *ngIf="product">
  <!-- Make the link conditional, but display content regardless -->
  <a [routerLink]="storeSlug ? ['/', storeSlug, 'product', product.id] : null" class="product-link">
    <div class="product-image-container">
      <img [src]="product.imageUrl || '/assets/images/placeholder.png'"
           [alt]="product.name"
           class="product-image">
    </div>
    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>
      <p class="product-price">{{ product.price | currency }}</p>
      <!-- Add other info like rating or tags if needed -->
    </div>
  </a>
  <div class="product-actions">
    <button class="add-to-cart-btn" (click)="onAddToCart()">Add to Cart</button>
    <!-- Optional: Add wishlist button -->
  </div>
</div>

```

# projects/storefront/src/app/shared/components/product-card/product-card.component.scss

```scss
// Using global variables defined in src/styles.scss

:host {
  display: block; // Ensure the component takes up block space
}

.product-card {
  background-color: var(--background-color);
  border: var(--border-width) solid var(--border-color);
  border-radius: var(--border-radius-lg);
  overflow: hidden; // Clip content
  display: flex;
  flex-direction: column;
  height: 100%; // Make card fill grid cell height if needed
  transition: var(--transition-base);
  box-shadow: var(--box-shadow-sm);

  // Approximate size from plan (250x350px) - aspect ratio can help
  // aspect-ratio: 250 / 350;
  // Or let the grid define width and control height implicitly or explicitly

  &:hover,
  &:focus-within { // Highlight when card or interactive elements inside have focus
    box-shadow: var(--box-shadow-md);
    transform: translateY(-3px);
    border-color: var(--neutral-medium);
  }
}

.product-link {
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  flex-grow: 1; // Allow link content to take available space above actions

  &:focus {
    outline: none; // Remove default outline, rely on card focus style
  }
}

.product-image-container {
  position: relative;
  overflow: hidden;
  // Define aspect ratio for image area, e.g., square or slightly taller
  aspect-ratio: 1 / 1;
  background-color: var(--neutral-lightest); // Placeholder background

  .product-card:hover &,
  .product-card:focus-within & {
    // Optional: Add effect on card hover/focus
  }
}

.product-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover; // Or 'contain' if full image visibility is crucial
  transition: transform 0.3s ease;

  .product-link:hover &,
  .product-link:focus & {
     transform: scale(1.05); // Zoom effect on link hover/focus
  }
}

.product-info {
  padding: var(--spacing-md);
  text-align: center; // Center align text info
  flex-grow: 1; // Allow info to push actions down
  display: flex;
  flex-direction: column;
  justify-content: space-between; // Push price down if space allows
}

.product-name {
  font-size: 1.1rem;
  font-weight: var(--font-weight-medium);
  color: var(--text-color);
  margin-bottom: var(--spacing-xs);
  // Limit lines and add ellipsis for long names
  display: -webkit-box;
  -webkit-line-clamp: 2; // Show max 2 lines
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: calc(1.3em * 2); // Reserve space for 2 lines
}

.product-price {
  font-size: 1.2rem;
  font-weight: var(--font-weight-bold);
  color: var(--primary-color); // Highlight price
  margin-top: auto; // Push price towards the bottom of info section
  margin-bottom: 0; // Remove default paragraph margin
}

.product-actions {
  padding: 0 var(--spacing-md) var(--spacing-md); // Padding around the button area
  margin-top: var(--spacing-sm); // Space above the button
}

.add-to-cart-btn {
  // Inherits base button styles from global styles.scss
  width: 100%; // Make button full width within actions area
  font-size: 0.9rem;
  padding: var(--spacing-sm) var(--spacing-md); // Slightly smaller padding

  // Optional: Style adjustments for secondary action feel
  // background-color: var(--secondary-color);
  // border-color: var(--secondary-color);
  // color: var(--primary-color);

  &:hover, &:focus {
    // Adjust hover state if needed
  }
}
```

# projects/storefront/src/app/shared/components/product-card/product-card.component.ts

```ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '@shared-types';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() storeSlug: string | null = null;

  constructor(private cartService: CartService) {}

  onAddToCart(): void {
    if (this.product) {
      console.log('Adding to cart:', this.product.name);
      // Call the service - handle potential errors/success feedback if needed
      this.cartService.addItem(this.product).subscribe({
        next: () => console.log(`${this.product.name} added to cart via service`),
        error: (err) => console.error('Failed to add item via service:', err)
      });
    } else {
      console.error('Product data is missing, cannot add to cart.');
    }
  }
}

```

# projects/storefront/src/app/shipping-policy/shipping-policy-page/shipping-policy-page.component.html

```html
<p>shipping-policy-page works!</p>

```

# projects/storefront/src/app/shipping-policy/shipping-policy-page/shipping-policy-page.component.scss

```scss

```

# projects/storefront/src/app/shipping-policy/shipping-policy-page/shipping-policy-page.component.spec.ts

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingPolicyPageComponent } from './shipping-policy-page.component';

describe('ShippingPolicyPageComponent', () => {
  let component: ShippingPolicyPageComponent;
  let fixture: ComponentFixture<ShippingPolicyPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShippingPolicyPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShippingPolicyPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

# projects/storefront/src/app/shipping-policy/shipping-policy-page/shipping-policy-page.component.ts

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-shipping-policy-page',
  standalone: true,
  imports: [],
  templateUrl: './shipping-policy-page.component.html',
  styleUrl: './shipping-policy-page.component.scss'
})
export class ShippingPolicyPageComponent {

}

```

# projects/storefront/src/app/shop/shop-page/shop-page.component.html

```html
<p>shop-page works!</p>

```

# projects/storefront/src/app/shop/shop-page/shop-page.component.scss

```scss

```

# projects/storefront/src/app/shop/shop-page/shop-page.component.spec.ts

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopPageComponent } from './shop-page.component';

describe('ShopPageComponent', () => {
  let component: ShopPageComponent;
  let fixture: ComponentFixture<ShopPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShopPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShopPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

# projects/storefront/src/app/shop/shop-page/shop-page.component.ts

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-shop-page',
  standalone: true,
  imports: [],
  templateUrl: './shop-page.component.html',
  styleUrl: './shop-page.component.scss'
})
export class ShopPageComponent {

}

```

# projects/storefront/src/index.html

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Storefront</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
</head>
<body>
  <app-root></app-root>
</body>
</html>

```

# projects/storefront/src/main.ts

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

```

# projects/storefront/src/styles.scss

```scss
@import './styles/_variables.scss'; // Import SCSS variables first

/* Global Styles - Modern & Minimalist Theme */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');

/* 1. CSS Custom Properties (Variables) */
:root {
  // Color Palette
  --primary-color: #3498db; // Modern Blue
  --secondary-color: #f0f2f5; // Light Gray Accent
  --text-color: #333333; // Dark Gray (Primary Text)
  --text-color-light: #666666; // Lighter Gray (Secondary Text)
  --border-color: #e0e0e0; // Light Gray Border
  --background-color: #ffffff; // White Background
  --success-color: #2ecc71;
  --error-color: #e74c3c;
  --warning-color: #f39c12;

  // Neutral Grays
  --neutral-lightest: #f8f9fa;
  --neutral-light: #e9ecef;
  --neutral-medium: #dee2e6;
  --neutral-dark: #adb5bd;
  --neutral-darkest: #495057;

  // Typography
  --font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  --font-size-base: 16px;
  --line-height-base: 1.6;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 700;

  // Spacing (Base Unit: 8px)
  --spacing-unit: 8px;
  --spacing-xs: calc(0.5 * var(--spacing-unit)); // 4px
  --spacing-sm: var(--spacing-unit); // 8px
  --spacing-md: calc(2 * var(--spacing-unit)); // 16px
  --spacing-lg: calc(3 * var(--spacing-unit)); // 24px
  --spacing-xl: calc(4 * var(--spacing-unit)); // 32px
  --spacing-xxl: calc(6 * var(--spacing-unit)); // 48px

  // Borders
  --border-radius-sm: 4px;
  --border-radius-md: 6px;
  --border-radius-lg: 8px;
  --border-width: 1px;

  // Shadows (Subtle)
  --box-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --box-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);

  // Transitions
  --transition-base: all 0.2s ease-in-out;

  // Layout
  --container-max-width: 1200px;
  --container-padding-x: var(--spacing-md); // 16px
}

/* 2. Base Styles */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: var(--font-size-base); // Typically 16px
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-family-base);
  line-height: var(--line-height-base);
  color: var(--text-color);
  background-color: var(--background-color);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 3. Typography Defaults */
h1, h2, h3, h4, h5, h6 {
  margin-bottom: var(--spacing-sm);
  font-weight: var(--font-weight-bold);
  line-height: 1.3;
  color: var(--text-color); // Ensure headings use primary text color
}

h1 { font-size: 2.5rem; } // ~40px
h2 { font-size: 2rem; }   // ~32px
h3 { font-size: 1.75rem; } // ~28px
h4 { font-size: 1.5rem; }  // ~24px
h5 { font-size: 1.25rem; } // ~20px
h6 { font-size: 1rem; }    // ~16px

p {
  margin-bottom: var(--spacing-md);
}

a {
  color: var(--primary-color);
  text-decoration: none;
  transition: var(--transition-base);
}

a:hover, a:focus {
  text-decoration: underline;
  opacity: 0.8;
}

/* 4. Button Base Styles */
button,
.button { // Allow applying button styles to other elements like links
  display: inline-block;
  padding: var(--spacing-sm) var(--spacing-md);
  font-family: inherit;
  font-size: 1rem;
  font-weight: var(--font-weight-medium);
  line-height: 1.5;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
  vertical-align: middle;
  cursor: pointer;
  user-select: none;
  border: var(--border-width) solid transparent;
  border-radius: var(--border-radius-md);
  transition: var(--transition-base);

  // Default Button Style (Primary)
  color: #fff;
  background-color: var(--primary-color);
  border-color: var(--primary-color);

  &:hover, &:focus {
    opacity: 0.85;
    text-decoration: none; // Prevent underline on buttons
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
}

// Secondary Button Style (Example)
.button-secondary {
  color: var(--primary-color);
  background-color: transparent;
  border-color: var(--primary-color);

  &:hover, &:focus {
    background-color: rgba(52, 152, 219, 0.1); // Light primary background on hover
    opacity: 1;
  }
}

/* 5. Form Element Base Styles (Simple Reset) */
input,
textarea,
select {
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.5;
  padding: var(--spacing-sm) var(--spacing-md);
  border: var(--border-width) solid var(--border-color);
  border-radius: var(--border-radius-md);
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  display: block; // Make inputs block level by default
  width: 100%; // Make inputs take full width by default

  &:focus {
    outline: 0;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 0.2rem rgba(52, 152, 219, 0.25); // Focus ring
  }
}

/* 6. Utility Classes */
.container {
  width: 100%;
  max-width: var(--container-max-width);
  margin-right: auto;
  margin-left: auto;
  padding-right: var(--container-padding-x);
  padding-left: var(--container-padding-x);
}

/* Add more utility classes as needed (e.g., for text alignment, display, etc.) */

```

# projects/storefront/src/styles/_variables.scss

```scss
// _variables.scss

// Color Palette (Modern & Minimalist)
$primary-color: #3498db; // A clean blue
$primary-color-light: lighten($primary-color, 15%);
$primary-color-dark: darken($primary-color, 15%);

$secondary-color: #95a5a6; // Optional secondary color (e.g., a muted gray)
$secondary-color-light: lighten($secondary-color, 15%);
$secondary-color-dark: darken($secondary-color, 15%);

$success-color: #2ecc71; // Green for success/checkout
$error-color: #e74c3c; // Red for errors/danger
$warning-color: #f39c12; // Yellow for warnings
$info-color: #3498db; // Blue for info (same as primary here)

$white: #ffffff;
$black: #000000;

// Neutral Grays
$neutral-lightest: #f8f9fa; // Very light gray for backgrounds
$neutral-light: #e9ecef;
$neutral-medium: #ced4da; // Often used for borders
$neutral-dark: #adb5bd;
$neutral-darkest: #495057; // Dark gray for text

// Text Colors
$text-color: $neutral-darkest;
$text-color-light: $neutral-dark;
$text-muted: $secondary-color;
$link-color: $primary-color;
$link-hover-color: $primary-color-dark;

// Background Colors
$background-color: $white;
$background-color-alt: $neutral-lightest;

// Borders
$border-color: $neutral-medium;
$border-radius-sm: 0.2rem;
$border-radius-md: 0.375rem;
$border-radius-lg: 0.5rem;

// Typography
$font-family-sans-serif: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
$font-family-base: $font-family-sans-serif;

$font-size-base: 1rem; // Typically 16px
$font-size-sm: $font-size-base * 0.875;
$font-size-lg: $font-size-base * 1.25;

$font-weight-light: 300;
$font-weight-normal: 400;
$font-weight-medium: 500; // Often used for buttons/labels
$font-weight-bold: 700;

$line-height-base: 1.5;
$line-height-sm: 1.25;
$line-height-lg: 1.75;

$h1-font-size: $font-size-base * 2.5;
$h2-font-size: $font-size-base * 2;
$h3-font-size: $font-size-base * 1.75;
$h4-font-size: $font-size-base * 1.5;
$h5-font-size: $font-size-base * 1.25;
$h6-font-size: $font-size-base;

// Spacing (Using 8px base unit)
$spacing-unit: 8px;
$spacing-xs: $spacing-unit * 0.5;   // 4px
$spacing-sm: $spacing-unit;        // 8px
$spacing-md: $spacing-unit * 1.5;  // 12px
$spacing-lg: $spacing-unit * 2;    // 16px
$spacing-xl: $spacing-unit * 3;    // 24px
$spacing-xxl: $spacing-unit * 4;   // 32px

// Layout
$container-max-width: 1200px;
$container-padding-x: $spacing-lg; // Horizontal padding for containers

// Shadows
$box-shadow-sm: 0 0.125rem 0.25rem rgba($black, 0.075);
$box-shadow-md: 0 0.5rem 1rem rgba($black, 0.15);
$box-shadow-lg: 0 1rem 3rem rgba($black, 0.175);

// Z-index
$zindex-dropdown: 1000;
$zindex-sticky: 1020;
$zindex-fixed: 1030;
$zindex-modal-backdrop: 1040;
$zindex-modal: 1050;
$zindex-popover: 1060;
$zindex-tooltip: 1070;
```

# projects/storefront/tsconfig.app.json

```json
/* To learn more about Typescript configuration file: https://www.typescriptlang.org/docs/handbook/tsconfig-json.html. */
/* To learn more about Angular compiler options: https://angular.dev/reference/configs/angular-compiler-options. */
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "../../out-tsc/app",
    "types": []
  },
  "files": [
    "src/main.ts"
  ],
  "include": [
    "src/**/*.d.ts"
  ]
}

```

# projects/storefront/tsconfig.spec.json

```json
/* To learn more about Typescript configuration file: https://www.typescriptlang.org/docs/handbook/tsconfig-json.html. */
/* To learn more about Angular compiler options: https://angular.dev/reference/configs/angular-compiler-options. */
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "../../out-tsc/spec",
    "types": [
      "jasmine"
    ]
  },
  "include": [
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}

```

# proxy.conf.json

```json
{
  "/api": {
    "target": "http://api:3000",
    "secure": false,
    "logLevel": "debug",
    "changeOrigin": true
  }
}

```

# tsconfig.json

```json
/* To learn more about Typescript configuration file: https://www.typescriptlang.org/docs/handbook/tsconfig-json.html. */
/* To learn more about Angular compiler options: https://angular.dev/reference/configs/angular-compiler-options. */
{
  "compileOnSave": false,
  "compilerOptions": {
    "baseUrl": "./", // Add baseUrl
    "outDir": "./dist/out-tsc",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "sourceMap": true,
    "declaration": false,
    "experimentalDecorators": true,
    "moduleResolution": "bundler",
    "paths": {
      "shared-types": [ // Keep for Angular builds
        "dist/shared-types/shared-types", // Adjust path based on ng-packagr output if needed
        "dist/shared-types"
      ],
      "@shared-types": [ // Add alias for direct source access
        "projects/shared-types/src/public-api.ts"
      ]
    },
    "importHelpers": true,
    "target": "ES2022",
    "module": "ES2022",
    "lib": [
      "ES2022",
      "dom"
    ]
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}

```

