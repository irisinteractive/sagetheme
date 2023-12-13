@extends('layouts.app')

@section('content')
  @include('partials.page-header')

  <i class="ci ci--schedule"></i>
  <i class="ci ci--remove-rounded"></i>
  <i class="ci ci--linkedin"></i>
  <i class="ci ci--favorite"></i>
  <i class="ci ci--confirmation-number"></i>
  <i class="ci ci--delete-forever"></i>
  <i class="ci ci--direction-run"></i>
  <i class="ci ci--edit"></i>
  <i class="ci ci--beenhere"></i>
  <i class="ci ci--by-a-boat"></i>
  <i class="ci ci--by-car"></i>
  <i class="ci ci--by-bus"></i>
  <i class="ci ci--by-plane"></i>
  <i class="ci ci--by-train"></i>

  @if (! have_posts())
    <x-alert type="warning">
      {!! __('Sorry, no results were found.', 'sage') !!}
    </x-alert>

    {!! get_search_form(false) !!}
  @endif

  @while(have_posts()) @php(the_post())
    @includeFirst(['partials.content-' . get_post_type(), 'partials.content'])
  @endwhile

  {!! get_the_posts_navigation() !!}
@endsection

@section('sidebar')
  @include('sections.sidebar')
@endsection
