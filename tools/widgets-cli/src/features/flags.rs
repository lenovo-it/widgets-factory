use clap::{Args, Parser, Subcommand, ValueEnum};
use strum::{Display, EnumIter};

/// We support these flavours.
#[derive(Clone, PartialEq, Ord, PartialOrd, Eq, ValueEnum, EnumIter, Debug, Display)]
#[strum(serialize_all = "lowercase")]
pub enum SubCommandNewFlavours {
  Svelte,
  Vue3,
  Lit,
  Solid,
}

/// Cli struct.
#[derive(Parser)]
#[command(about, long_about = None, arg_required_else_help = true)]
pub struct Cli {
  /// Turn debugging information on.
  #[arg(short, long, default_value_t = false)]
  pub debug: bool,

  #[command(subcommand)]
  pub command: Option<Commands>,
}

/// Cli flags - new.
#[derive(Args)]
pub struct SubCommandNewFlags {
  /// The project name.
  #[arg(short, long)]
  pub name: Option<String>,
  /// The project flavour.
  #[arg(short, long)]
  pub flavour: Option<SubCommandNewFlavours>,
}

/// Commands enum.
#[derive(Subcommand)]
pub enum Commands {
  /// Generate a new widget package skeleton.
  New(SubCommandNewFlags),
}
