//! # Widgets Cli
//!
//! This is a simple cli project aimed to create the widget packages.
//! Try to execute this under the top folder of this `widgets-factory` project.
//!
//! ## Brief introduction
//!
//! ```text
//! E:\Codes>widgets
//!
//! Widgets cli with napi-rs.
//!
//! Usage: widgets [OPTIONS] [COMMAND]
//!
//! Commands:
//!   new   Generate a new widget package skeleton
//!   help  Print this message or the help of the given subcommand(s)
//!
//! Options:
//!   -d, --debug  Turn debugging information on
//!   -h, --help   Print help
//! ```
//!
//! ## Generate a new widget package
//!
//! A simple usage.
//! ```bash
//! widgets new --name test-for-demo --flavour svelte
//! ```
//! This command will generate the new folder named `test-for-demo` under the `widgets-factory/packages` directory with the preset `svelte` scaffold.
//!
//! And if you didn't preset the `--name` or `--flavour`.
//! The process will start a prompt to ask for presetting.
//!
//! The `--name` option should be a valid file name, it cannot contain these **English characters**: `\`, `/`, `:`, `*`, `?`, `"`, `<`, `>` and `|`.
//! And it will be forcibly transformed into lowercase format.
//!
//! The `--flavours` option should be valid under this enum [`flags::SubCommandNewFlavours`] with the **lowercase** format.
//! If it is not preset with the command, the process will start a `select` prompt to let you choose.

#![deny(clippy::all)]
#[macro_use]
extern crate napi_derive;

pub mod commands;
pub mod error;
pub mod features;

use clap::Parser;
use features::{flags, params};
use napi::bindgen_prelude::*;

/// The main entry of this napi package.
#[napi]
pub fn run(args: Vec<String>, params: params::RunParams) -> Result<Undefined> {
  let cli = flags::Cli::parse_from(args.iter());

  // You can check for the existence of subcommands, and if found use their
  // matches just as you would the top level cmd
  match &cli.command {
    Some(flags::Commands::New(new_flags)) => {
      commands::new::exec(&cli, new_flags, &params)?;
    }
    None => {
      unimplemented!();
    }
  }

  Ok(())
}
